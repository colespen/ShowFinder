import type { Show, ShowPage } from "./show.ts";

export type UpstreamName = "locationiq" | "rapidapi" | "spotify" | "ticketmaster";

/**
 * LocationIQ payloads are forwarded to the client largely as received, so only
 * the fields the server reads are declared and the rest is passed through.
 */
export interface CurrentAddress {
  address?: Record<string, string>;
  display_name?: string;
  lat?: string;
  lon?: string;
  boundingbox?: string[];
  importance?: string;
  [key: string]: unknown;
}

export interface GeoSearchResult {
  lat: string;
  lon: string;
  importance?: string;
  display_name?: string;
  [key: string]: unknown;
}

export interface ShowsResponse {
  data: Show[];
  currentAddress: CurrentAddress;
  page: ShowPage;
}

/** `/api/newshows` omits `currentAddress` when the city resolves to nothing. */
export interface NewShowsResponse {
  data: Show[];
  latLng: GeoSearchResult[];
  page: ShowPage;
  currentAddress?: CurrentAddress;
}

export interface HealthResponse {
  status: "healthy" | "misconfigured";
  ready: boolean;
  configured: Record<UpstreamName, boolean>;
  missing: UpstreamName[];
}

export interface SpotifyArtist {
  id: string;
  name: string;
  spotifyUrl: string;
}

export interface SpotifySampleResponse {
  artist: SpotifyArtist | null;
  tracks: SpotifyTrack[];
}

/** Only the fields the client's player reads. */
export interface SpotifyTrack {
  id: string;
  name: string;
  preview_url?: string | null;
}

export interface ApiErrorBody {
  error: string;
  upstreamStatus?: number | null;
}
