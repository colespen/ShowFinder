import type { DateRange, Show, ShowPage } from "../types/show.ts";
import { UpstreamLocationError, describeError } from "../utils/errors.ts";
import { mergeShows } from "../utils/mergeShows.ts";
import { searchMusicEvents } from "./rapidapi.ts";
import type { ShowSearchResult } from "./rapidapi.ts";
import { searchMusicEvents as searchTicketmasterEvents } from "./ticketmaster.ts";

export function emptyPage(size: number): ShowPage {
  return { number: 0, size, totalElements: 0, totalPages: 0, fetched: 0 };
}

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
      ? searchTicketmasterEvents({ lat: Number(lat), lng: Number(lng), dateRange })
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
 * Tries each name in order and returns the first that yields shows. The upstream
 * rejects some qualified names ("London, United Kingdom" -> error) and
 * mis-resolves borough names ("City of Westminster" -> Sydney).
 */
export async function searchShowsForCity(
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
export function bareName(name: string | null): string {
  return String(name ?? "").split(",")[0].trim();
}
