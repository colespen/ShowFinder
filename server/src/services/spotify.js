const axios = require("axios");
const { normalizeArtist } = require("../utils/artistName");

/**
 * Resolves an artist name to a Spotify artist, server-side.
 *
 * The point is to make the *server* decide which Spotify artist an act is, so the
 * client never has to fuzzy-match names. Two things make the lookup succeed where
 * a naive "first search hit" does not:
 *
 *   1. Aliases. The event sources disagree on names, and the plain artist name
 *      resolves far better than a ticketing tour title. Measured on Toronto: the
 *      aggregator's name recovered 8 of 8 acts the Ticketmaster name could not.
 *   2. Candidate scoring over the top hits. A correct artist can sit below the
 *      first result (MARO was 2nd), so all hits are scored rather than trusting
 *      artists[0]. Searching deeper only pays off once the *right term* is used -
 *      scanning further for a bad term gained nothing at all.
 *
 * An artist that cannot be confidently identified resolves to null, and the UI
 * shows no link, which beats linking to the wrong act.
 */

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const API = "https://api.spotify.com/v1";
// Spotify's preview_url is null for this app's credentials, so previews are read
// from the public embed page instead (see resolvePreviewUrls).
const MAX_TRACKS = 3;
const CANDIDATE_LIMIT = 10;
const ARTIST_TTL_MS = 6 * 60 * 60 * 1000;
const TRACKS_TTL_MS = 30 * 60 * 1000;
const TOKEN_MARGIN_MS = 60 * 1000;

let token = null;
let tokenExpiresAt = 0;
// Keyed by normalised search term, so every alias spelling is cached separately.
const artistCache = new Map();
const tracksCache = new Map();

function cacheGet(cache, key, ttl) {
  const hit = cache.get(key);
  if (!hit) return undefined;
  if (hit.expiresAt < Date.now()) {
    cache.delete(key);
    return undefined;
  }
  return hit.value;
}

function cacheSet(cache, key, value, ttl) {
  // Cheap bound: these maps only ever hold one city's worth of artists.
  if (cache.size > 2000) cache.clear();
  cache.set(key, { value, expiresAt: Date.now() + ttl });
  return value;
}

/** Client-credentials token, refreshed here rather than relying on the client. */
async function getToken() {
  if (token && Date.now() < tokenExpiresAt) return token;

  const { CLIENT_ID, CLIENT_SECRET } = process.env;
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error("Spotify credentials are not configured");
  }

  const response = await axios.post(TOKEN_URL, "grant_type=client_credentials", {
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    timeout: 15000,
  });

  token = response.data.access_token;
  tokenExpiresAt =
    Date.now() + Number(response.data.expires_in || 3600) * 1000 - TOKEN_MARGIN_MS;
  return token;
}

async function searchArtists(term, bearer) {
  const response = await axios.get(`${API}/search`, {
    params: { q: term, type: "artist", limit: CANDIDATE_LIMIT },
    headers: { Authorization: `Bearer ${bearer}` },
    timeout: 15000,
  });
  return response.data?.artists?.items || [];
}

/**
 * Picks the candidate that is the act we asked for, or null.
 *
 * Only two things count as a match: the name matching outright, or the candidate
 * opening the term. A hit found *later* inside the term is rejected, because that
 * is how a tribute act resolved to the real band ("Who Made Who / AC/DC Tribute"
 * -> AC/DC), how "Higgi at the Elmo - A Live Recording Event" resolved to an
 * unrelated artist called Elmo, and how a misspelt act resolved to whichever
 * popular name shared a word with it.
 *
 * Headliners come first in these names and the merge supplies an alias for
 * anything else, so requiring the opening position loses no measured coverage
 * while removing the wrong-artist links. Between two matching prefixes the longer
 * one wins, since it is the more specific act.
 */
function pickArtist(candidates, term) {
  const wanted = normalizeArtist(term);
  if (!wanted) return null;

  let best = null;
  for (const candidate of candidates) {
    const name = normalizeArtist(candidate?.name);
    if (!name) continue;

    const rank = name === wanted ? 0 : wanted.startsWith(`${name} `) ? 1 : null;
    if (rank === null) continue;

    const better =
      !best ||
      rank < best.rank ||
      (rank === best.rank && name.length > best.name.length);
    if (better) best = { candidate, rank, name };
  }

  if (!best) return null;
  return {
    id: best.candidate.id,
    name: best.candidate.name,
    spotifyUrl: best.candidate.external_urls?.spotify || "",
  };
}

/** Resolves one search term, cached. Returns null when nothing matches. */
async function resolveTerm(term) {
  const key = normalizeArtist(term);
  if (!key) return null;

  const cached = cacheGet(artistCache, key);
  if (cached !== undefined) return cached;

  let resolved = null;
  try {
    const bearer = await getToken();
    resolved = pickArtist(await searchArtists(term, bearer), term);
  } catch (error) {
    console.error("Spotify search failed:", error.message);
  }
  return cacheSet(artistCache, key, resolved, ARTIST_TTL_MS);
}

/** The act under any of its known spellings, primary name first. */
async function resolveArtist(name, aliases = []) {
  for (const term of [name, ...aliases]) {
    if (!term) continue;
    const artist = await resolveTerm(term);
    if (artist) return artist;
  }
  return null;
}

/**
 * Spotify returns preview_url: null to this app, so the public embed page is used
 * to recover a 30s MP3 for the in-app player.
 */
async function resolvePreviewUrls(tracks) {
  await Promise.all(
    tracks.map(async (track) => {
      if (!track?.id || track.preview_url) return;
      try {
        const response = await axios.get(
          `https://open.spotify.com/embed/track/${track.id}`,
          { headers: { "Content-Type": "application/json" }, timeout: 15000 },
        );
        const match =
          /<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/s.exec(
            response.data,
          );
        const preview = match
          ? JSON.parse(match[1])?.props?.pageProps?.state?.data?.entity?.audioPreview?.url
          : "";
        if (preview) track.preview_url = preview;
      } catch (error) {
        console.error(`Spotify embed failed for ${track.id}:`, error.message);
      }
    }),
  );
  return tracks;
}

/** Top tracks for an artist, previews resolved, cached. */
async function topTracks(artistId) {
  const cached = cacheGet(tracksCache, artistId);
  if (cached !== undefined) return cached;

  let tracks = [];
  try {
    const bearer = await getToken();
    const response = await axios.get(`${API}/artists/${artistId}/top-tracks`, {
      params: { market: "US" },
      headers: { Authorization: `Bearer ${bearer}` },
      timeout: 15000,
    });
    tracks = (response.data?.tracks || []).slice(0, MAX_TRACKS);
    await resolvePreviewUrls(tracks);
  } catch (error) {
    console.error("Spotify top-tracks failed:", error.message);
  }
  return cacheSet(tracksCache, artistId, tracks, TRACKS_TTL_MS);
}

/** Artist plus its playable tracks, or `{ artist: null, tracks: [] }`. */
async function findArtistPreview(name, aliases = []) {
  const artist = await resolveArtist(name, aliases);
  if (!artist) return { artist: null, tracks: [] };
  return { artist, tracks: await topTracks(artist.id) };
}

module.exports = { findArtistPreview, resolveArtist, pickArtist, getToken };

