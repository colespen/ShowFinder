/**
 * Maps LocationIQ's full region names (e.g. "Texas") to 2-letter codes,
 * which RapidAPI's /location geocoder requires to disambiguate a city.
 */
const US_STATES = {
  alabama: "AL",
  alaska: "AK",
  arizona: "AZ",
  arkansas: "AR",
  california: "CA",
  colorado: "CO",
  connecticut: "CT",
  delaware: "DE",
  "district of columbia": "DC",
  florida: "FL",
  georgia: "GA",
  hawaii: "HI",
  idaho: "ID",
  illinois: "IL",
  indiana: "IN",
  iowa: "IA",
  kansas: "KS",
  kentucky: "KY",
  louisiana: "LA",
  maine: "ME",
  maryland: "MD",
  massachusetts: "MA",
  michigan: "MI",
  minnesota: "MN",
  mississippi: "MS",
  missouri: "MO",
  montana: "MT",
  nebraska: "NE",
  nevada: "NV",
  "new hampshire": "NH",
  "new jersey": "NJ",
  "new mexico": "NM",
  "new york": "NY",
  "north carolina": "NC",
  "north dakota": "ND",
  ohio: "OH",
  oklahoma: "OK",
  oregon: "OR",
  pennsylvania: "PA",
  "rhode island": "RI",
  "south carolina": "SC",
  "south dakota": "SD",
  tennessee: "TN",
  texas: "TX",
  utah: "UT",
  vermont: "VT",
  virginia: "VA",
  washington: "WA",
  "west virginia": "WV",
  wisconsin: "WI",
  wyoming: "WY",
};

const CA_PROVINCES = {
  alberta: "AB",
  "british columbia": "BC",
  manitoba: "MB",
  "new brunswick": "NB",
  "newfoundland and labrador": "NL",
  "nova scotia": "NS",
  ontario: "ON",
  "prince edward island": "PE",
  quebec: "QC",
  saskatchewan: "SK",
  yukon: "YT",
  "northwest territories": "NT",
  nunavut: "NU",
};

function lookup(table, regionName) {
  if (!regionName) return "";
  return table[regionName.trim().toLowerCase()] || "";
}

/**
 * Resolves a 2-letter region code from LocationIQ's `state` + `country_code`.
 * Returns "" when unknown, so callers fall back to the bare city name.
 */
function regionCode(state, countryCode) {
  const code = String(countryCode || "").toLowerCase();
  if (code === "us") return lookup(US_STATES, state);
  if (code === "ca") return lookup(CA_PROVINCES, state);
  return "";
}

module.exports = { regionCode };
