function settlementName(address = {}) {
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

function normalizeCurrentAddress(currentAddress = {}) {
  const address = { ...(currentAddress.address || {}) };
  const city = settlementName(address);
  if (city) {
    address.city = city;
  }
  return { ...currentAddress, address };
}

function todayYmd() {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

/** Max selectable window. A 7-day window already saturates the fetch budget in
 * a dense city, so wider ranges return no extra shows. */
const MAX_WINDOW_DAYS = 14;

function parseYmd(dateStr) {
  const parts = String(dateStr || "")
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
function parseDateRange(dateRange = {}, maxWindowDays = MAX_WINDOW_DAYS) {
  const today = todayYmd();
  const minDate = dateRange.minDate || today;
  const requestedMax = dateRange.maxDate || minDate;

  const start = parseYmd(minDate);
  const requestedEnd = parseYmd(requestedMax);
  if (!start || !requestedEnd) {
    // Unparseable input: fall back to today rather than forwarding bad values.
    return { minDate: today, maxDate: today };
  }

  // Guard against an inverted range before clamping.
  const from = requestedEnd < start ? requestedEnd : start;
  const to = requestedEnd < start ? start : requestedEnd;

  const limit = new Date(from);
  limit.setDate(limit.getDate() + maxWindowDays);

  const end = to > limit ? limit : to;
  const maxDate = `${end.getFullYear()}-${end.getMonth() + 1}-${end.getDate()}`;
  const minDateOut = `${from.getFullYear()}-${from.getMonth() + 1}-${from.getDate()}`;
  return { minDate: minDateOut, maxDate };
}

function hasValidCoords(lat, lng) {
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

module.exports = {
  settlementName,
  normalizeCurrentAddress,
  parseDateRange,
  hasValidCoords,
  MAX_WINDOW_DAYS,
};
