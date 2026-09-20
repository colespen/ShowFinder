const { usStateCode } = require("./usStateCode");

/** Builds the city query for RapidAPI's /location geocoder. Qualifier form
 * differs by country: US needs the state code ("Austin, TX" works, "Austin,
 * United States" returns nothing), others need the country name. Falls back to
 * the bare city when no qualifier is available. */
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

