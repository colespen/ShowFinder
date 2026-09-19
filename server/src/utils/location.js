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

function parseDateRange(dateRange = {}) {
  const today = todayYmd();
  const minDate = dateRange.minDate || today;
  const maxDate = dateRange.maxDate || minDate || today;
  return { minDate, maxDate };
}

function padDatePart(value) {
  return String(value).padStart(2, "0");
}

function toIsoBound(dateStr, endOfDay) {
  const parts = String(dateStr || "")
    .split("-")
    .map((part) => Number(part));
  if (parts.length < 3 || parts.some((part) => !Number.isFinite(part))) {
    return toIsoBound(todayYmd(), endOfDay);
  }
  const [year, month, day] = parts;
  const hh = endOfDay ? "23" : "00";
  const mm = endOfDay ? "59" : "00";
  const ss = endOfDay ? "59" : "00";
  return `${year}-${padDatePart(month)}-${padDatePart(day)}T${hh}:${mm}:${ss}Z`;
}

function toLocalBound(dateStr, endOfDay) {
  const parts = String(dateStr || "")
    .split("-")
    .map((part) => Number(part));
  if (parts.length < 3 || parts.some((part) => !Number.isFinite(part))) {
    return toLocalBound(todayYmd(), endOfDay);
  }
  const [year, month, day] = parts;
  const hh = endOfDay ? "23" : "00";
  const mm = endOfDay ? "59" : "00";
  const ss = endOfDay ? "59" : "00";
  return `${year}-${padDatePart(month)}-${padDatePart(day)}T${hh}:${mm}:${ss}`;
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
  toIsoBound,
  toLocalBound,
  hasValidCoords,
};
