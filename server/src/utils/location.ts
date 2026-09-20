import type { CurrentAddress } from "../types/api.ts";
import type { DateRange } from "../types/show.ts";

export function settlementName(address: Record<string, string> = {}): string {
  return (
    address.city ||
    address.town ||
    address.village ||
    address.hamlet ||
    address.municipality ||
    address.locality ||
    address.city_district ||
    address.suburb ||
    ""
  );
}

/** LocationIQ lists a settlement under whichever key fits, so fold it onto `city`. */
export function normalizeCurrentAddress(
  currentAddress: CurrentAddress = {},
): CurrentAddress {
  const address = { ...(currentAddress.address ?? {}) };
  const city = settlementName(address);
  if (city) {
    address.city = city;
  }
  return { ...currentAddress, address };
}

export function todayYmd(): string {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

/** Max selectable window. A 7-day window already saturates the fetch budget in
 * a dense city, so wider ranges return no extra shows. */
export const MAX_WINDOW_DAYS = 14;

function parseYmd(dateStr: string | undefined): Date | null {
  const parts = String(dateStr ?? "")
    .split("-")
    .map((part) => Number(part));
  if (parts.length < 3 || parts.some((part) => !Number.isFinite(part))) {
    return null;
  }
  const [year, month, day] = parts;
  return new Date(year, month - 1, day);
}

/** Clamps the requested window to MAX_WINDOW_DAYS from its start, mirroring the
 * calendar's own limit so a wide or absent range cannot cause extra fetches. */
export function parseDateRange(
  dateRange: DateRange = {},
  maxWindowDays = MAX_WINDOW_DAYS,
): Required<DateRange> {
  const today = todayYmd();
  const minDate = dateRange.minDate || today;
  const requestedMax = dateRange.maxDate || minDate;

  const start = parseYmd(minDate);
  const requestedEnd = parseYmd(requestedMax);
  if (!start || !requestedEnd) {
    return { minDate: today, maxDate: today };
  }

  const from = requestedEnd < start ? requestedEnd : start;
  const to = requestedEnd < start ? start : requestedEnd;

  const limit = new Date(from);
  limit.setDate(limit.getDate() + maxWindowDays);

  const end = to > limit ? limit : to;
  const maxDate = `${end.getFullYear()}-${end.getMonth() + 1}-${end.getDate()}`;
  const minDateOut = `${from.getFullYear()}-${from.getMonth() + 1}-${from.getDate()}`;
  return { minDate: minDateOut, maxDate };
}

export function hasValidCoords(lat: unknown, lng: unknown): boolean {
  const latitude = Number(lat);
  const longitude = Number(lng);
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    !(latitude === 0 && longitude === 0) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

