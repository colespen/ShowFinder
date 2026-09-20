import axios from "axios";

import { env } from "../config/env.ts";
import type { SpotifyArtist, SpotifySampleResponse, SpotifyTrack } from "../types/api.ts";
import type {
  SpotifyArtistItem,
  SpotifyArtistSearchResponse,
  SpotifyEmbedResponse,
  SpotifyTokenResponse,
  SpotifyTopTracksResponse,
} from "../types/upstream/spotify.ts";
import { normalizeArtist } from "../utils/artistName.ts";

/**
 * Resolves an artist name to a Spotify artist, server-side.
 *
 * The server decides which Spotify artist an act is so the client never has to
 * fuzzy-match names. Two things make the lookup succeed where a naive "first
 * search hit" does not:
 *
 *   1. Aliases. The event sources disagree on names, and the plain artist name
 *      resolves far better than a ticketing tour title. Measured on Toronto: the
 *      aggregator's name recovered 8 of 8 acts the Ticketmaster name could not.
 *   2. Candidate scoring over the top hits. A correct artist can sit below the
 *      first result (MARO was 2nd), so all hits are scored rather than trusting
 *      artists[0]. Scanning deeper only pays off once the right term is used -
 *      searching further for a bad term gained nothing at all.
 *
 * An artist that cannot be confidently identified resolves to null, and the UI
 * shows no link, which beats linking to the wrong act.
 */

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const API = "https://api.spotify.com/v1";
const MAX_TRACKS = 3;
const CANDIDATE_LIMIT = 10;
const ARTIST_TTL_MS = 6 * 60 * 60 * 1000;
const TRACKS_TTL_MS = 30 * 60 * 1000;
const TOKEN_MARGIN_MS = 60 * 1000;

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

let token: string | null = null;
let tokenExpiresAt = 0;
// Keyed by normalised search term, so every alias spelling is cached separately.
const artistCache = new Map<string, CacheEntry<SpotifyArtist | null>>();
const tracksCache = new Map<string, CacheEntry<SpotifyTrack[]>>();

function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function cacheGet<T>(cache: Map<string, CacheEntry<T>>, key: string): T | undefined {
  const hit = cache.get(key);
  if (!hit) return undefined;
  if (hit.expiresAt < Date.now()) {
    cache.delete(key);
    return undefined;
  }
  return hit.value;
}

function cacheSet<T>(
  cache: Map<string, CacheEntry<T>>,
  key: string,
  value: T,
  ttlMs: number,
): T {
  // Cheap bound: these maps only ever hold one city's worth of artists.
  if (cache.size > 2000) cache.clear();
  cache.set(key, { value, expiresAt: Date.now() + ttlMs });
  return value;
}

/** Client-credentials token, refreshed here rather than relying on the client. */
export async function getToken(): Promise<string> {
  if (token && Date.now() < tokenExpiresAt) return token;

  const { spotifyClientId, spotifyClientSecret } = env;
  if (!spotifyClientId || !spotifyClientSecret) {
    throw new Error("Spotify credentials are not configured");
  }

  const response = await axios.post<SpotifyTokenResponse>(
    TOKEN_URL,
    "grant_type=client_credentials",
    {
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(`${spotifyClientId}:${spotifyClientSecret}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      timeout: 15000,
    },
  );

  const accessToken = response.data.access_token;
  token = accessToken;
  tokenExpiresAt =
    Date.now() + Number(response.data.expires_in ?? 3600) * 1000 - TOKEN_MARGIN_MS;
  return accessToken;
}

async function searchArtists(
  term: string,
  bearer: string,
): Promise<SpotifyArtistItem[]> {
  const response = await axios.get<SpotifyArtistSearchResponse>(
    `${API}/search`,
    {
      params: { q: term, type: "artist", limit: CANDIDATE_LIMIT },
      headers: { Authorization: `Bearer ${bearer}` },
      timeout: 15000,
    },
  );
  return response.data?.artists?.items ?? [];
}

/**
 * Only two things count as a match: the name matching outright, or the candidate
 * opening the term. A hit found later inside the term is rejected, because that
 * is how a tribute act resolved to the real band ("Who Made Who / AC/DC Tribute"
 * -> AC/DC), how "Higgi at the Elmo - A Live Recording Event" resolved to an
 * unrelated artist called Elmo, and how a misspelt act resolved to whichever
 * popular name shared a word with it.
 *
 * Headliners come first in these names and the merge supplies an alias for
 * anything else, so requiring the opening position loses no measured coverage.
 * Between two matching prefixes the longer one wins, being the more specific act.
 */
export function pickArtist(
  candidates: SpotifyArtistItem[],
  term: string,
): SpotifyArtist | null {
  const wanted = normalizeArtist(term);
  if (!wanted) return null;

  let best: { candidate: SpotifyArtistItem; rank: number; name: string } | null = null;
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
    spotifyUrl: best.candidate.external_urls?.spotify ?? "",
  };
}

/** Resolves one search term, cached. Returns null when nothing matches. */
async function resolveTerm(term: string): Promise<SpotifyArtist | null> {
  const key = normalizeArtist(term);
  if (!key) return null;

  const cached = cacheGet(artistCache, key);
  if (cached !== undefined) return cached;

  let resolved: SpotifyArtist | null = null;
  try {
    const bearer = await getToken();
    resolved = pickArtist(await searchArtists(term, bearer), term);
  } catch (error) {
    console.error("Spotify search failed:", describeError(error));
  }
  return cacheSet(artistCache, key, resolved, ARTIST_TTL_MS);
}

/** The act under any of its known spellings, primary name first. */
async function resolveArtist(
  name: string | undefined,
  aliases: string[] = [],
): Promise<SpotifyArtist | null> {
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
async function resolvePreviewUrls(tracks: SpotifyTrack[]): Promise<SpotifyTrack[]> {
  await Promise.all(
    tracks.map(async (track) => {
      if (!track?.id || track.preview_url) return;
      try {
        const response = await axios.get<string>(
          `https://open.spotify.com/embed/track/${track.id}`,
          { headers: { "Content-Type": "application/json" }, timeout: 15000 },
        );
        const match =
          /<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/s.exec(
            response.data,
          );
        if (!match) return;
        const parsed = JSON.parse(match[1]) as SpotifyEmbedResponse;
        const preview = parsed?.props?.pageProps?.state?.data?.entity?.audioPreview?.url;
        if (preview) track.preview_url = preview;
      } catch (error) {
        console.error(`Spotify embed failed for ${track.id}:`, describeError(error));
      }
    }),
  );
  return tracks;
}

/** Top tracks for an artist, previews resolved, cached. */
async function topTracks(artistId: string): Promise<SpotifyTrack[]> {
  const cached = cacheGet(tracksCache, artistId);
  if (cached !== undefined) return cached;

  let tracks: SpotifyTrack[] = [];
  try {
    const bearer = await getToken();
    const response = await axios.get<SpotifyTopTracksResponse>(
      `${API}/artists/${artistId}/top-tracks`,
      {
        params: { market: "US" },
        headers: { Authorization: `Bearer ${bearer}` },
        timeout: 15000,
      },
    );
    tracks = (response.data?.tracks ?? []).slice(0, MAX_TRACKS);
    await resolvePreviewUrls(tracks);
  } catch (error) {
    console.error("Spotify top-tracks failed:", describeError(error));
  }
  return cacheSet(tracksCache, artistId, tracks, TRACKS_TTL_MS);
}

/** Artist plus its playable tracks, or `{ artist: null, tracks: [] }`. */
export async function findArtistPreview(
  name: string | undefined,
  aliases: string[] = [],
): Promise<SpotifySampleResponse> {
  const artist = await resolveArtist(name, aliases);
  if (!artist) return { artist: null, tracks: [] };
  return { artist, tracks: await topTracks(artist.id) };
}
