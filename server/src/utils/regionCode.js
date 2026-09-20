/**
 * LocationIQ returns full region names (e.g. "Texas", "Ontario") but the
 * RapidAPI /location geocoder only disambiguates reliably with 2-letter
 * region codes (e.g. "Austin, TX"). Passing a bare city name resolves to
 * the wrong city for ambiguous names ("Portland" returned Nashville shows),
 * and passing the full region name returns no results at all.
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
 * Resolve a 2-letter region code from LocationIQ's `state` field plus the
 * `country_code`, so city queries can be disambiguated. Returns "" when the
 * region is unknown, in which case callers should fall back to the bare city.
 */
function regionCode(state, countryCode) {
  const code = String(countryCode || "").toLowerCase();
  if (code === "us") return lookup(US_STATES, state);
  if (code === "ca") return lookup(CA_PROVINCES, state);
  return "";
}

module.exports = { regionCode };
