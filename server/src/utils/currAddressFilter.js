const { regionCode } = require("./regionCode");

/**
 * Build the city query string for RapidAPI's /location geocoder.
 *
 * A bare city name is ambiguous — "Portland" resolved to Nashville shows,
 * and appending a country or full region name ("Austin, Texas") returns
 * nothing. The reliable shape is "City, ST" using a 2-letter region code,
 * which was verified against Austin, Portland, Toronto, Cedar Park, and Buda.
 * Falls back to the bare city name when no region code can be resolved.
 */
const filterCurrentAddress = (currentAddress) => {
  const address = currentAddress?.address || {};
  const city = address.city || "";
  if (!city) return "";
  const code = regionCode(address.state, address.country_code);
  return code ? `${city}, ${code}` : city;
};

module.exports = filterCurrentAddress;
