/**
 * Merges show lists from independent sources (the location aggregator and
 * Ticketmaster Discovery) into one de-duplicated, app-shaped list.
 *
 * Cross-provider dedupe is entity resolution: the feeds share no event id, and
 * they describe one gig inconsistently. The aggregator says "The Charlatans",
 * Ticketmaster says "The Charlatans UK"; when Discovery lists no attractions it
 * falls back to the event title as the performer. So identity is rebuilt from
 * structural facts, and a show matches if EITHER tier agrees:
 *
 *   1. venue + local day + start time  - survives artist-name drift
 *   2. artist + local day              - survives venue-name drift
 *
 * Two tiers rather than one field, because either alone loses matches: venue
 * alone splits "H-E-B Center at Cedar Park" from "H-E-B Center", artist alone
 * misses the name variants above. Matching on either is a superset of both.
 *
 * A missed match shows one gig twice; a wrong match silently hides it, so tiers
 * stay exact - no fuzzy scoring - and anything unkeyed is kept, never dropped.
 * The artist tier is the weaker one, so it demands agreeing start times too: one
 * act can play an early and a late set in the same room on the same night.
 */

const { normalizeArtist, isSameAct } = require("./artistName");

/** Local calendar day, from either "YYYY-MM-DD" or a full ISO datetime. */
function dayOf(value) {
  return String(value || "").slice(0, 10);
}

/** Local wall-clock time, or "" when the provider knows only the date. */
function timeOf(value) {
  const match = /T(\d{2}:\d{2})/.exec(String(value || ""));
  return match ? match[1] : "";
}

/**
 * Strongest key: same room, same day, same minute. A shared start minute is
 * near-unique between two providers, whereas venue *names* drift. Returns ""
 * when any part is unknown, so a missing time never matches on this tier.
 */
function venueKey(show) {
  const venue = normalizeArtist(show?.venue?.name);
  const day = dayOf(show?.startDate);
  const time = timeOf(show?.startDate);
  return venue && day && time ? `${venue}|${day}|${time}` : "";
}

/** Fallback key: same headliner, same day. */
function artistKey(show) {
  const artist = normalizeArtist(show?.performers?.[0]?.name);
  const day = dayOf(show?.startDate);
  return artist && day ? `${artist}|${day}` : "";
}

/** How far apart two start times may be and still describe one show. */
const ARTIST_TIER_WINDOW_MINUTES = 120;

function toMinutes(time) {
  return Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
}

/**
 * The artist+day key is the weaker tier, so a match also needs the start times to
 * agree within a window. Matching venue names are deliberately NOT enough: one
 * act can play two sets in the same room on one night (Blue Note runs 8pm and
 * 10:30pm), so venue equality would still collapse two real shows into one row.
 * Hiding a real event is worse than showing one twice.
 */
function isSameShow(a, b) {
  const timeA = timeOf(a?.startDate);
  const timeB = timeOf(b?.startDate);
  if (!timeA || !timeB) return true; // nothing on hand to contradict the match
  return (
    Math.abs(toMinutes(timeA) - toMinutes(timeB)) <= ARTIST_TIER_WINDOW_MINUTES
  );
}

/**
 * The preferred source's bill is authoritative and kept as-is; the other source
 * only contributes acts that bill does not already name. A blind concat would
 * list one act twice whenever the providers format it differently, and the
 * preferred (ticketing) source is the one that spells line-ups out in full.
 *
 * When both sources do name one act, the alternate spelling is kept as an alias.
 * Ticketmaster often uses a tour title ("MATRAKK (Free Before Midnight)") where
 * the aggregator uses the plain artist name ("Matrakk"), and Spotify resolves the
 * plain name far more reliably, so the alias is what makes that lookup work.
 */
function mergePerformers(preferred, other) {
  const kept = (preferred || []).filter((performer) => normalizeArtist(performer?.name));

  for (const performer of other || []) {
    const name = normalizeArtist(performer?.name);
    if (!name) continue;

    const index = kept.findIndex((entry) => isSameAct(normalizeArtist(entry.name), name));
    if (index === -1) {
      kept.push(performer);
      continue;
    }

    const entry = kept[index];
    const aliases = [...(entry.aliases || [])];
    if (normalizeArtist(entry.name) !== name && !aliases.includes(performer.name)) {
      aliases.push(performer.name);
    }
    // Same act under another name: borrow its links if the kept copy lacks them.
    kept[index] = {
      ...entry,
      spotifyArtistId: entry.spotifyArtistId || performer.spotifyArtistId || "",
      spotifyUrl: entry.spotifyUrl || performer.spotifyUrl || "",
      ...(aliases.length ? { aliases } : {}),
    };
  }

  return kept;
}

/**
 * Field-level merge, preferred source winning each field: the providers are
 * strong in different places (Ticketmaster has coordinates and ticket links,
 * the aggregator a fuller line-up), so swapping whole records loses data.
 */
function mergeShow(preferred, other) {
  const spare = other?.venue || {};
  return {
    ...other,
    ...preferred,
    id: preferred?.id || other?.id || "",
    name: preferred?.name || other?.name || "",
    startDate: preferred?.startDate || other?.startDate || "",
    image: preferred?.image || other?.image || "",
    ticketUrl: preferred?.ticketUrl || other?.ticketUrl || "",
    venue: {
      ...spare,
      ...(preferred?.venue || {}),
      // ?? not ||, so a legitimate 0 coordinate is not read as missing.
      latitude: preferred?.venue?.latitude ?? spare.latitude ?? null,
      longitude: preferred?.venue?.longitude ?? spare.longitude ?? null,
    },
    performers: mergePerformers(preferred?.performers, other?.performers),
  };
}

/**
 * `sources` are merged in order of preference: earlier sources win each field.
 * Indexes hold canonical slots, so a re-merge can overwrite in place.
 */
function mergeShows(...sources) {
  const records = [];
  const byVenue = new Map();
  const byArtist = new Map();
  let duplicates = 0;

  const claim = (show, venue, artist) => {
    const index = records.push(show) - 1;
    if (venue && !byVenue.has(venue)) byVenue.set(venue, index);
    if (artist && !byArtist.has(artist)) byArtist.set(artist, index);
  };

  for (const source of sources) {
    for (const show of source || []) {
      if (!show) continue;

      const venue = venueKey(show);
      const artist = artistKey(show);

      // Strongest signal first; either tier is enough to call it a match, but
      // the artist tier must also survive isSameShow's consistency check.
      let match;
      if (venue) match = byVenue.get(venue);
      if (match === undefined && artist) {
        const candidate = byArtist.get(artist);
        if (candidate !== undefined && isSameShow(records[candidate], show)) {
          match = candidate;
        }
      }

      if (match === undefined) {
        claim(show, venue, artist);
        continue;
      }

      duplicates += 1;
      records[match] = mergeShow(records[match], show);
      // A merge can supply a key the first copy lacked; index it too.
      if (venue && !byVenue.has(venue)) byVenue.set(venue, match);
      if (artist && !byArtist.has(artist)) byArtist.set(artist, match);
    }
  }

  // Located shows first so unplotable ones sort last; the id tiebreak keeps the
  // order stable when two shows share a venue and start time.
  records.sort((a, b) => {
    const aLocated = a?.venue?.latitude !== null && a?.venue?.latitude !== undefined;
    const bLocated = b?.venue?.latitude !== null && b?.venue?.latitude !== undefined;
    if (aLocated !== bLocated) return aLocated ? -1 : 1;
    const byDate = String(a?.startDate || "").localeCompare(String(b?.startDate || ""));
    if (byDate !== 0) return byDate;
    return String(a?.id || "").localeCompare(String(b?.id || ""));
  });

  return { data: records, duplicates };
}

module.exports = { mergeShows, venueKey, artistKey, normalizeArtist };
