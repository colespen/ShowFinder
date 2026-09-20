import axios from "axios";

import { env } from "../config/env.ts";
import { mapRapidEvents } from "../mappers/rapidShowMapper.ts";
import type { DateRange, Show, ShowPage } from "../types/show.ts";
import type {
  RapidEvent,
  RapidLocationResponse,
} from "../types/upstream/rapidapi.ts";
import { UpstreamLocationError } from "../utils/errors.ts";
import { parseDateRange } from "../utils/location.ts";

const HOST = "concerts-artists-events-tracker.p.rapidapi.com";

// Hard ceilings per search: at most MAX_PAGES requests / MAX_EVENTS shows. A
// 14-day window in a dense city fills this budget, so it is a deliberate
// quota/coverage tradeoff.
const MAX_EVENTS = 400;
const MAX_PAGES = 5;
const PAGE_DELAY_MS = 200;
const PAGE_SIZE = 50; // upstream caps /location at 50 per page

export interface ShowSearchResult {
  data: Show[];
  page: ShowPage;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** RapidAPI wants unpadded YYYY-M-D (2026-9-20), not the padded form. */
function toRapidDate(dateStr: string): string {
  const parts = String(dateStr ?? "")
    .split("-")
    .map((part) => Number(part));
  if (parts.length < 3 || parts.some((part) => !Number.isFinite(part))) {
    return dateStr;
  }
  const [year, month, day] = parts;
  return `${year}-${month}-${day}`;
}

interface LocationPageArgs {
  apiKey: string;
  name: string;
  minDate: string;
  maxDate: string;
  page: number;
}

async function fetchLocationPage({
  apiKey,
  name,
  minDate,
  maxDate,
  page,
}: LocationPageArgs): Promise<RapidEvent[]> {
  const params = new URLSearchParams({
    name,
    minDate,
    maxDate,
    page: String(page),
  });

  const response = await axios.get<RapidLocationResponse>(
    `https://${HOST}/location?${params.toString()}`,
    {
      headers: {
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": HOST,
      },
      timeout: 15000,
    },
  );

  const remaining = response.headers["x-ratelimit-requests-remaining"];
  if (remaining !== undefined) {
    console.log("RapidAPI requests remaining:", remaining);
  }

  if (response.data?.error) {
    throw new UpstreamLocationError(response.data.error);
  }

  return Array.isArray(response.data?.data) ? response.data.data : [];
}

// Administrative prefixes that turn a place name into a borough the upstream
// cannot resolve (LocationIQ reports central London as "City of Westminster",
// which maps to Sydney shows).
const ADMIN_PREFIX =
  /^(city of|royal borough of|london borough of|borough of|county of|metropolitan borough of)\s+/i;

export function withoutAdminPrefix(name: string | undefined): string {
  const raw = String(name ?? "");
  const stripped = raw.replace(ADMIN_PREFIX, "").trim();
  return stripped && stripped !== raw ? stripped : "";
}

/** Retries transient failures; an unresolvable name is deterministic, so it is
 * surfaced immediately for the caller to widen the query. */
async function fetchLocationPageWithRetry(
  args: LocationPageArgs,
  retries = 4,
): Promise<RapidEvent[]> {
  let lastError: unknown;
  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      return await fetchLocationPage(args);
    } catch (error) {
      if (error instanceof UpstreamLocationError) throw error;
      lastError = error;
      await sleep(500);
    }
  }
  throw lastError;
}

export async function searchMusicEvents({
  cityName,
  dateRange,
}: {
  cityName: string;
  dateRange?: DateRange;
}): Promise<ShowSearchResult> {
  const apiKey = env.rapidApiKey;
  if (!apiKey) {
    throw new Error("RAPID_KEY is not configured");
  }
  if (!cityName) {
    throw new Error("cityName is required");
  }

  const { minDate, maxDate } = parseDateRange(dateRange);
  const minDateParam = toRapidDate(minDate);
  const maxDateParam = toRapidDate(maxDate);

  const rawEvents: RapidEvent[] = [];
  let page = 1;
  let requests = 0;

  while (rawEvents.length < MAX_EVENTS && page <= MAX_PAGES) {
    const events = await fetchLocationPageWithRetry({
      apiKey,
      name: cityName,
      minDate: minDateParam,
      maxDate: maxDateParam,
      page,
    });
    requests += 1;

    if (!events.length) break;
    rawEvents.push(...events);

    if (events.length < PAGE_SIZE) break; // short page = last page
    page += 1;
    await sleep(PAGE_DELAY_MS);
  }

  const data = mapRapidEvents(rawEvents).slice(0, MAX_EVENTS);
  return {
    data,
    page: {
      number: 0,
      size: PAGE_SIZE,
      totalElements: data.length,
      // Upstream requests actually made, capped at MAX_PAGES.
      totalPages: requests,
      fetched: data.length,
    },
  };
}
