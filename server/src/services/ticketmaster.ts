import axios from "axios";

import { env } from "../config/env.ts";
import type { DateRange, Performer, Show, Venue } from "../types/show.ts";
import type {
  TicketmasterAttraction,
  TicketmasterDateStart,
  TicketmasterEvent,
  TicketmasterEventsResponse,
  TicketmasterImage,
  TicketmasterLink,
  TicketmasterVenue,
} from "../types/upstream/ticketmaster.ts";
import { parseDateRange } from "../utils/location.ts";
import type { ShowSearchResult } from "./rapidapi.ts";

const HOST = "https://app.ticketmaster.com/discovery/v2/events.json";
// Discovery caps `size` at 200 (500 is rejected outright).
const PAGE_SIZE = 200;
const MAX_PAGES = 3;
const DEFAULT_RADIUS_MILES = 50;

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/** "2026-9-2" -> "2026-09-02", so day strings can be compared directly. */
export function toYmd(ymd: string | undefined): string {
  const [year, month, day] = String(ymd ?? "")
    .split("-")
    .map((part) => Number(part));
  if (![year, month, day].every(Number.isFinite)) return "";
  return `${year}-${pad(month)}-${pad(day)}`;
}

/**
 * Discovery accepts only `YYYY-MM-DDTHH:mm:ssZ` and 400s on the millisecond
 * form `toISOString()` produces, so the fraction is dropped here.
 */
export function toDiscoveryDateTime(
  ymd: string | undefined,
  endOfDay: boolean,
): string {
  const day = toYmd(ymd);
  if (!day) return "";
  const time = endOfDay ? "23:59:59" : "00:00:00";
  return `${day}T${time}Z`;
}

/**
 * Discovery sometimes ignores its own startDateTime/endDateTime filter and
 * returns past-dated, offsale events (Toronto "today" came back with three
 * Aug 23 classes and two Sep 19 parties), so the window is re-applied here.
 * Undated events are kept rather than guessed at, matching mergeShows.
 */
function inDateWindow(
  startDate: string | undefined,
  minDate: string,
  maxDate: string,
): boolean {
  const day = String(startDate ?? "").slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return true;
  return day >= minDate && day <= maxDate;
}

function toCoord(value: string | number | undefined): number | null {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

/** Prefers the largest 16:9 image, falling back to any available image. */
function pickImage(images: TicketmasterImage[] = []): string {
  if (!Array.isArray(images) || !images.length) return "";
  const wide = images.filter((image) => image.ratio === "16_9" && image.url);
  const pool = wide.length ? wide : images.filter((image) => image.url);
  if (!pool.length) return "";
  return (
    pool.reduce((best, image) =>
      Number(image.width) > Number(best.width) ? image : best,
    ).url ?? ""
  );
}

/** The audio player expects an ISO-ish local datetime. */
function toLocalDateTime(start: TicketmasterDateStart = {}): string {
  if (start.localDate && start.localTime) {
    return `${start.localDate}T${start.localTime}`;
  }
  return start.localDate ?? start.dateTime ?? "";
}

/** Discovery embeds the Spotify artist link, sparing a separate lookup. */
function spotifyArtistId(attraction: TicketmasterAttraction = {}): string {
  const links: TicketmasterLink[] | undefined = attraction.externalLinks?.spotify;
  if (!Array.isArray(links) || !links.length) return "";
  try {
    const profile = new URL(String(links[0].url ?? ""));
    const parts = profile.pathname.split("/").filter(Boolean);
    return parts[0] === "artist" && parts[1] ? parts[1] : "";
  } catch {
    return "";
  }
}

function mapVenue(venue: TicketmasterVenue = {}): Venue {
  return {
    name: venue.name ?? "",
    url: venue.url ?? "",
    city: venue.city?.name ?? venue.address?.city ?? "",
    latitude: toCoord(venue.location?.latitude),
    longitude: toCoord(venue.location?.longitude),
  };
}

function mapPerformer(attraction: TicketmasterAttraction = {}): Performer {
  const artistId = spotifyArtistId(attraction);
  return {
    name: attraction.name ?? "",
    spotifyArtistId: artistId,
    spotifyUrl: artistId ? `https://open.spotify.com/artist/${artistId}` : "",
    website: attraction.externalLinks?.homepage?.[0]?.url ?? "",
  };
}

/** Falls back to the event name when Discovery lists no attractions. */
function mapEvent(event: TicketmasterEvent = {}): Show {
  const venue = mapVenue(event._embedded?.venues?.[0] ?? {});
  const performers = (event._embedded?.attractions ?? [])
    .map(mapPerformer)
    .filter((performer) => performer.name);

  if (!performers.length && event.name) {
    performers.push({
      name: event.name,
      spotifyArtistId: "",
      spotifyUrl: "",
      website: "",
    });
  }

  return {
    id: String(event.id ?? ""),
    name: event.name ?? "",
    startDate: toLocalDateTime(event.dates?.start ?? {}),
    image: pickImage(event.images),
    ticketUrl: event.url ?? "",
    venue,
    performers,
  };
}

export function mapTicketmasterEvents(
  rawEvents: TicketmasterEvent[] = [],
): Show[] {
  const seen = new Set<string>();
  const mapped: Show[] = [];

  for (const event of rawEvents) {
    if (!event?.id || seen.has(event.id)) continue;
    const show = mapEvent(event);
    // Coordinate-less venues cannot be plotted and break marker alignment.
    if (!show.venue.name || show.venue.latitude === null) continue;
    seen.add(event.id);
    mapped.push(show);
  }

  return mapped;
}

interface FetchPageArgs {
  apiKey: string;
  lat: number;
  lng: number;
  radius: number;
  minDate: string;
  maxDate: string;
  page: number;
}

async function fetchPage({
  apiKey,
  lat,
  lng,
  radius,
  minDate,
  maxDate,
  page,
}: FetchPageArgs): Promise<TicketmasterEventsResponse> {
  const params = new URLSearchParams({
    apikey: apiKey,
    // Discovery silently ignores the `geoPoint` geohash parameter and returns
    // every event nationwide; `latlong` is the only correct geo filter.
    latlong: `${lat},${lng}`,
    radius: String(radius),
    unit: "miles",
    size: String(PAGE_SIZE),
    page: String(page),
    sort: "date,asc",
    classificationName: "music",
    startDateTime: toDiscoveryDateTime(minDate, false),
    endDateTime: toDiscoveryDateTime(maxDate, true),
  });

  const response = await axios.get<TicketmasterEventsResponse>(
    `${HOST}?${params.toString()}`,
    { timeout: 15000 },
  );
  return response.data ?? {};
}

/**
 * Discovery is coordinate-first, so passing real lat/long sidesteps the
 * city-name resolution problems the name-based upstream suffers from.
 */
export async function searchMusicEvents({
  lat,
  lng,
  dateRange,
  radius,
}: {
  lat: number;
  lng: number;
  dateRange?: DateRange;
  radius?: number;
}): Promise<ShowSearchResult> {
  const apiKey = env.ticketmasterKey;
  if (!apiKey) {
    throw new Error("TICKETMASTER_KEY is not configured");
  }

  const latitude = Number(lat);
  const longitude = Number(lng);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error("Valid lat and lng are required for Ticketmaster");
  }

  const { minDate, maxDate } = parseDateRange(dateRange);
  const windowStart = toYmd(minDate);
  const windowEnd = toYmd(maxDate);
  const radiusMiles = Number(radius) > 0 ? Number(radius) : DEFAULT_RADIUS_MILES;

  const rawEvents: TicketmasterEvent[] = [];
  let upstreamTotal = 0;
  let requests = 0;
  let page = 0;

  while (page < MAX_PAGES) {
    const body = await fetchPage({
      apiKey,
      lat: latitude,
      lng: longitude,
      radius: radiusMiles,
      minDate,
      maxDate,
      page,
    });
    requests += 1;

    upstreamTotal = body.page?.totalElements ?? rawEvents.length;
    const events = body._embedded?.events ?? [];
    if (!events.length) break;
    rawEvents.push(...events);

    if (events.length < PAGE_SIZE || rawEvents.length >= upstreamTotal) break;
    page += 1;
  }

  const data = mapTicketmasterEvents(rawEvents).filter((show) =>
    inDateWindow(show.startDate, windowStart, windowEnd),
  );

  return {
    data,
    page: {
      number: 0,
      size: PAGE_SIZE,
      totalElements: upstreamTotal,
      totalPages: requests,
      fetched: data.length,
    },
  };
}

export { DEFAULT_RADIUS_MILES };
