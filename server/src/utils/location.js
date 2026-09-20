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
};
