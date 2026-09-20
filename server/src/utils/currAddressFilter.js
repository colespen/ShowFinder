// RapidAPI's /location geocoder is unreliable when a country name/code is
// appended (e.g. "Austin, United States of America" or "Austin, US" both
// intermittently return zero results even though the city exists). Using
// the bare city name is the reliable query shape, confirmed against
// Austin, New York, London, and Toronto.
const filterCurrentAddress = (currentAddress) => {
  return currentAddress.address.city || "";
};

module.exports = filterCurrentAddress;
