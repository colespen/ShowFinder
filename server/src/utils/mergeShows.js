/**
 * Merges show lists from independent sources (Songkick-style aggregator and
 * Ticketmaster Discovery) into one de-duplicated list.
 *
 * The two sources share no event id, so events are matched on artist + date.
 * That pairing is deliberately conservative: an artist playing twice on one day
 * is rare, and a venue term would split legitimate matches because the upstream
 * names venues differently ("H-E-B Center at Cedar Park" vs "H-E-B Center").
 */

/** Lowercases and strips punctuation/the/a so name formats can be compared. */
function normalizeArtist(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/\bthe\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Local calendar day, from either "YYYY-MM-DD" or a full ISO datetime. */
function dayOf(value) {
  return String(value || "").slice(0, 10);
}

function primaryArtist(show) {
  const performer = show?.performers?.[0];
  return normalizeArtist(performer?.name);
}

function eventKey(show) {
  const artist = primaryArtist(show);
  const day = dayOf(show?.startDate);
  return artist && day ? `${artist}|${day}` : "";
}

/**
 * Higher wins when both sources hold the same event. Ticketmaster is preferred
 * because it supplies venue coordinates, ticket links and Spotify artist ids
 * that the aggregator omits.
 */
function richness(show) {
  let score = 0;
  if (show?.venue?.latitude !== null && show?.venue?.latitude !== undefined) {
    score += 4;
  }
  if (show?.ticketUrl) score += 2;
  if (show?.image) score += 1;
  if (show?.performers?.some((performer) => performer.spotifyArtistId)) {
    score += 2;
  }
  return score;
}

/**
 * `sources` are merged in order of preference: on a collision the richer entry
 * wins, with ties going to the earlier source.
 */
function mergeShows(...sources) {
  const byKey = new Map();
  const unkeyed = [];
  let duplicates = 0;

  for (const source of sources) {
    for (const show of source || []) {
      if (!show) continue;
      const key = eventKey(show);
      if (!key) {
        // No usable artist/date pair: keep it rather than silently dropping.
        unkeyed.push(show);
        continue;
      }

      const existing = byKey.get(key);
      if (!existing) {
        byKey.set(key, show);
        continue;
      }

      duplicates += 1;
      if (richness(show) > richness(existing)) {
        byKey.set(key, show);
      }
    }
  }

  // Prefer each entry's own coordinates so unplotable shows sort last.
  const merged = [...byKey.values(), ...unkeyed];
  merged.sort((a, b) => {
    const aLocated = a?.venue?.latitude !== null && a?.venue?.latitude !== undefined;
    const bLocated = b?.venue?.latitude !== null && b?.venue?.latitude !== undefined;
    if (aLocated !== bLocated) return aLocated ? -1 : 1;
    return String(a?.startDate || "").localeCompare(String(b?.startDate || ""));
  });

  return { data: merged, duplicates };
}

module.exports = { mergeShows, eventKey, normalizeArtist };
