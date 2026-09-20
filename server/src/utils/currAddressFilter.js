const { usStateCode } = require("./usStateCode");

/**
 * Build the city query for RapidAPI's /location geocoder.
 *
 * A bare city name is ambiguous and can resolve to the wrong place
 * ("Portland" -> Nashville shows, "Berlin" -> Philadelphia shows). Qualifiers
 * are required, and their accepted forms differ by country:
 *   US: "Austin, TX"     (state code; "Austin, United States" returns nothing)
 *   other: "Berlin, Germany" / "Toronto, Canada"  (country name)
 * Falls back to the bare city when no qualifier is available.
 */
const filterCurrentAddress = (currentAddress) => {
  const address = currentAddress?.address || {};
  const city = address.city || "";
  if (!city) return "";

  const countryCode = String(address.country_code || "").toLowerCase();
  const state = usStateCode(address.state);
  if (countryCode === "us" && state) return `${city}, ${state}`;
  if (countryCode !== "us" && address.country) return `${city}, ${address.country}`;
  return city;
};

module.exports = filterCurrentAddress;

