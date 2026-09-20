const { regionCode } = require("./regionCode");

/**
 * Builds the city query for RapidAPI's /location geocoder.
 *
 * "City, ST" (2-letter region code) is the only reliable shape: a bare city
 * resolves to the wrong place ("Portland" -> Nashville shows) and a full
 * region/country name returns nothing ("Austin, Texas"). Falls back to the
 * bare city when no region code is known.
 */
const filterCurrentAddress = (currentAddress) => {
  const address = currentAddress?.address || {};
  const city = address.city || "";
  if (!city) return "";
  const code = regionCode(address.state, address.country_code);
  return code ? `${city}, ${code}` : city;
};

module.exports = filterCurrentAddress;
