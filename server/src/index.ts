import cors from "cors";
import express from "express";
import type { Response } from "express";
import axios from "axios";
import type { AxiosResponse } from "axios";
import morgan from "morgan";

import { configuredUpstreams, env, missingRequiredUpstreams } from "./config/env.ts";
import { withoutAdminPrefix, searchMusicEvents } from "./services/rapidapi.ts";
import type { ShowSearchResult } from "./services/rapidapi.ts";
import { searchMusicEvents as searchTicketmasterEvents } from "./services/ticketmaster.ts";
import * as spotify from "./services/spotify.ts";
import type {
  ApiErrorBody,
  CurrentAddress,
  GeoSearchResult,
  HealthResponse,
  NewShowsResponse,
  ShowsResponse,
  SpotifySampleResponse,
} from "./types/api.ts";
import type { DateRange, Show, ShowPage } from "./types/show.ts";
import { UpstreamLocationError } from "./utils/errors.ts";
import { filterCurrentAddress } from "./utils/currAddressFilter.ts";
import {
  hasValidCoords,
  normalizeCurrentAddress,
} from "./utils/location.ts";
import { mergeShows } from "./utils/mergeShows.ts";

const app = express();

// Express 5 defaults to the "simple" query parser, which would leave the
// client's nested `dateRange[minDate]` param unparsed and silently widen every
// request back to today. "extended" keeps the Express 4 behaviour.
app.set("query parser", "extended");

app.use(cors({ origin: env.corsOrigin, optionsSuccessStatus: 200 }));
app.use(morgan("tiny"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function emptyPage(size: number): ShowPage {
  return { number: 0, size, totalElements: 0, totalPages: 0, fetched: 0 };
}

function sendError(
  res: Response<ApiErrorBody>,
  error: unknown,
  fallbackStatus = 500,
): void {
  const upstream = axios.isAxiosError(error) ? error.response?.status : undefined;
  const message = error instanceof Error ? error.message : "Unknown error";
  const url = axios.isAxiosError(error) ? (error.config?.url ?? "") : "";
  console.error("Error:", message, upstream ? `(upstream ${upstream})` : "", url);
  res.status(fallbackStatus).json({ error: message, upstreamStatus: upstream ?? null });
}

/** Retries LocationIQ's per-second 429s; other errors and 404s propagate. */
async function getWithRateLimitRetry(
  url: string,
  retries = 3,
): Promise<AxiosResponse<unknown>> {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await axios.get(url);
    } catch (error) {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      if (!(status === 429 && attempt < retries)) throw error;
      await new Promise((resolve) => setTimeout(resolve, 600 * (attempt + 1)));
    }
  }
}

async function reverseGeocode(lat: unknown, lng: unknown): Promise<CurrentAddress> {
  const params = new URLSearchParams({
    key: env.locationIqToken ?? "",
    lat: String(lat),
    lon: String(lng),
    format: "json",
    zoom: "10",
    normalizecity: "1",
    normalizeaddress: "1",
    addressdetails: "1",
  });
  const response = await getWithRateLimitRetry(
    `https://us1.locationiq.com/v1/reverse?${params.toString()}`,
  );
  return normalizeCurrentAddress(response.data as CurrentAddress);
}

async function forwardGeocode(city: string): Promise<GeoSearchResult[]> {
  const params = new URLSearchParams({
    key: env.locationIqToken ?? "",
    city,
    format: "json",
    addressdetails: "1",
  });
  try {
    const response = await getWithRateLimitRetry(
      `https://us1.locationiq.com/v1/search?${params.toString()}`,
    );
    const results = Array.isArray(response.data)
      ? (response.data as GeoSearchResult[])
      : [];
    return [...results].sort(
      (a, b) => parseFloat(b.importance ?? "") - parseFloat(a.importance ?? ""),
    );
  } catch (error) {
    // LocationIQ 404s when nothing matches; treat as no results, not an error.
    if (axios.isAxiosError(error) && error.response?.status === 404) return [];
    throw error;
  }
}

/** Date range arrives as `dateRange[minDate]=...&dateRange[maxDate]=...`. */
function parseDateRangeQuery(value: unknown): DateRange {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const { minDate, maxDate } = value as Record<string, unknown>;
  return {
    minDate: typeof minDate === "string" ? minDate : undefined,
    maxDate: typeof maxDate === "string" ? maxDate : undefined,
  };
}

app.get("/", (_req, res: Response<{ message: string; status: string }>) => {
  res.json({ message: "ShowFinder API is running", status: "healthy" });
});

// Reports which upstreams are configured (booleans only, never values), so a
// deploy can be verified in one request.
app.get("/api/health", (_req, res: Response<HealthResponse>) => {
  const configured = configuredUpstreams();
  const missing = missingRequiredUpstreams();
  const ready = missing.length === 0;

  res.status(ready ? 200 : 503).json({
    status: ready ? "healthy" : "misconfigured",
    ready,
    configured,
    missing,
  });
});

/**
 * Fetches from both sources in parallel and merges the results.
 *
 * Ticketmaster is listed first so on a collision the merge prefers it: it
 * supplies venue coordinates, ticket links and Spotify artist ids the
 * aggregator omits. It is optional - a missing key or failure degrades to
 * aggregator-only results rather than failing the request.
 */
async function fetchAndMerge({
  cityName,
  lat,
  lng,
  dateRange,
}: {
  cityName: string;
  lat?: unknown;
  lng?: unknown;
  dateRange?: DateRange;
}): Promise<ShowSearchResult> {
  const hasCoords = Number.isFinite(Number(lat)) && Number.isFinite(Number(lng));

  const [aggregator, ticketmaster] = await Promise.allSettled([
    searchMusicEvents({ cityName, dateRange }),
    hasCoords
      ? searchTicketmasterEvents({
          lat: Number(lat),
          lng: Number(lng),
          dateRange,
        })
      : Promise.resolve<ShowSearchResult>({ data: [], page: emptyPage(0) }),
  ]);

  if (aggregator.status === "rejected") throw aggregator.reason;

  const tmData: Show[] =
    ticketmaster.status === "fulfilled" ? ticketmaster.value.data : [];
  if (ticketmaster.status === "rejected") {
    console.warn("Ticketmaster skipped:", describeError(ticketmaster.reason));
  }

  const { data } = mergeShows(tmData, aggregator.value.data);
  return { data, page: aggregator.value.page };
}

/**
 * Tries each name in order and returns the first that yields shows. The
 * upstream rejects some qualified names ("London, United Kingdom" -> error)
 * and mis-resolves borough names ("City of Westminster" -> Sydney).
 */
async function searchShowsForCity(
  candidateNames: (string | undefined)[],
  dateRange: DateRange | undefined,
  coords: { lat?: unknown; lng?: unknown } = {},
): Promise<ShowSearchResult & { locationName: string | null }> {
  const tried: string[] = [];
  let lastError: unknown = null;

  for (const name of candidateNames) {
    if (!name || tried.includes(name)) continue;
    tried.push(name);
    try {
      const result = await fetchAndMerge({
        cityName: name,
        lat: coords.lat,
        lng: coords.lng,
        dateRange,
      });
      if (result.data.length) return { ...result, locationName: name };
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError && !(lastError instanceof UpstreamLocationError)) throw lastError;

  try {
    const result = await fetchAndMerge({
      cityName: tried[0] ?? "",
      lat: coords.lat,
      lng: coords.lng,
      dateRange,
    });
    return { ...result, locationName: tried[0] ?? null };
  } catch {
    return { data: [], page: emptyPage(50), locationName: null };
  }
}

/** Strips a trailing region qualifier, e.g. "Westminster, United Kingdom". */
function bareName(name: string | null): string {
  return String(name ?? "").split(",")[0].trim();
}

app.get("/api/shows", async (req, res: Response<ShowsResponse | ApiErrorBody>) => {
  try {
    const { lat, lng } = req.query;
    if (!hasValidCoords(lat, lng)) {
      res.status(400).json({
        error: "Valid lat and lng are required (got 0,0 or missing GPS)",
      });
      return;
    }

    const currentAddress = await reverseGeocode(lat, lng);
    const address = currentAddress.address ?? {};
    // Order matters: the first non-empty result wins, and a borough-qualified
    // name returns wrong shows rather than failing ("City of Westminster" ->
    // Sydney), so the prefix-stripped "Westminster" is tried first.
    const { data, page, locationName } = await searchShowsForCity(
      [
        withoutAdminPrefix(address.city),
        filterCurrentAddress(currentAddress),
        address.city,
        address.state,
      ],
      parseDateRangeQuery(req.query.dateRange),
      { lat, lng },
    );

    const displayAddress: CurrentAddress = {
      ...currentAddress,
      address: {
        ...address,
        city: bareName(locationName) || address.city || "",
      },
    };

    res.json({ data, currentAddress: displayAddress, page });
  } catch (error) {
    sendError(res, error);
  }
});

app.get("/api/newshows", async (req, res: Response<NewShowsResponse | ApiErrorBody>) => {
  try {
    const newCity = typeof req.query.newCity === "string" ? req.query.newCity : "";
    if (!newCity) {
      res.status(400).json({ error: "newCity is required" });
      return;
    }

    const latLng = await forwardGeocode(newCity);
    if (!latLng.length) {
      res.json({ data: [], latLng: [], page: emptyPage(50) });
      return;
    }

    // Widen from "City, Country"/"City, ST" to the bare/typed city.
    const address = normalizeCurrentAddress(latLng[0] as CurrentAddress).address ?? {};
    const first = latLng[0];
    const { data, page, locationName } = await searchShowsForCity(
      [filterCurrentAddress({ address }), address.city, address.state, newCity],
      parseDateRangeQuery(req.query.dateRange),
      { lat: first.lat, lng: first.lon },
    );

    const displayAddress: CurrentAddress = {
      address: { ...address, city: bareName(locationName) || address.city || newCity },
    };
    res.json({ data, latLng, page, currentAddress: displayAddress });
  } catch (error) {
    sendError(res, error);
  }
});

// Kept so existing clients can warm the token on load; the server now refreshes
// it on its own, so this is no longer required for previews to work.
app.post("/api/spotifyauth", async (_req, res) => {
  try {
    await spotify.getToken();
    res.sendStatus(200);
  } catch (error) {
    console.error("Spotify auth error:", describeError(error));
    res.status(500).send("Error: " + describeError(error));
  }
});

/**
 * Resolves the headliner to a Spotify artist and returns its top tracks.
 * `aliases` carries the other provider's spelling of the same act (pipe
 * separated), which is what rescues names like a Ticketmaster tour title.
 */
app.get(
  "/api/spotifysample",
  async (req, res: Response<SpotifySampleResponse | string>) => {
    try {
      const aliases = String(req.query.aliases ?? "")
        .split("|")
        .map((alias) => alias.trim())
        .filter(Boolean);
      const artistName = typeof req.query.artist === "string" ? req.query.artist : undefined;
      const { artist, tracks } = await spotify.findArtistPreview(artistName, aliases);
      res.json({ artist, tracks });
    } catch (error) {
      console.error("Spotify API Error:", describeError(error));
      res.status(500).send("Error: " + describeError(error));
    }
  },
);

app.listen(env.port, () => {
  console.log(`Server listening on port ${env.port} `);
});
