import type { UpstreamName } from "../types/api.ts";

/** All environment access lives here. Optional upstreams stay undefined and degrade. */

export const env = {
  port: Number(process.env.PORT) || 8001,
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
  locationIqToken: process.env.IQ_TOKEN,
  rapidApiKey: process.env.RAPID_KEY,
  ticketmasterKey: process.env.TICKETMASTER_KEY,
  spotifyClientId: process.env.CLIENT_ID,
  spotifyClientSecret: process.env.CLIENT_SECRET,
} as const;

/** Spotify and Ticketmaster only enrich results, so neither blocks readiness. */
const OPTIONAL_UPSTREAMS: UpstreamName[] = ["spotify", "ticketmaster"];

export function configuredUpstreams(): Record<UpstreamName, boolean> {
  return {
    locationiq: Boolean(env.locationIqToken),
    rapidapi: Boolean(env.rapidApiKey),
    spotify: Boolean(env.spotifyClientId && env.spotifyClientSecret),
    ticketmaster: Boolean(env.ticketmasterKey),
  };
}

export function missingRequiredUpstreams(): UpstreamName[] {
  return (Object.entries(configuredUpstreams()) as [UpstreamName, boolean][])
    .filter(([name, configured]) => !configured && !OPTIONAL_UPSTREAMS.includes(name))
    .map(([name]) => name);
}
