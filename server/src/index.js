const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
const axios = require("axios");

dotenv.config();

const { searchMusicEvents, withoutAdminPrefix } = require("./services/rapidapi");
const {
  searchMusicEvents: searchTicketmasterEvents,
} = require("./services/ticketmaster");
const { mergeShows } = require("./utils/mergeShows");
const spotify = require("./services/spotify");
const { normalizeCurrentAddress, hasValidCoords } = require("./utils/location");
const filterCurrentAddress = require("./utils/currAddressFilter");

const app = express();

const corsOptions = {
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(morgan("tiny"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT || 8001;
const iqToken = process.env.IQ_TOKEN;

function sendError(res, error, fallbackStatus = 500) {
  const upstream = error.response?.status;
  const message = error.message || "Unknown error";
  const url = error.config?.url || "";
  console.error("Error:", message, upstream ? `(upstream ${upstream})` : "", url);
  res.status(fallbackStatus).json({
    error: message,
    upstreamStatus: upstream || null,
  });
}

/** Retries LocationIQ's per-second 429s; other errors and 404s propagate. */
async function getWithRateLimitRetry(url, retries = 3) {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await axios.get(url);
    } catch (error) {
      const status = error.response?.status;
      const retryable = status === 429 && attempt < retries;
      if (!retryable) throw error;
      await new Promise((resolve) => setTimeout(resolve, 600 * (attempt + 1)));
    }
  }
}

async function reverseGeocode(lat, lng) {
  const params = new URLSearchParams({
    key: iqToken,
    lat,
    lon: lng,
    format: "json",
    zoom: "10",
    normalizecity: "1",
    normalizeaddress: "1",
    addressdetails: "1",
  });
  const response = await getWithRateLimitRetry(
    `https://us1.locationiq.com/v1/reverse?${params.toString()}`,
  );
  return normalizeCurrentAddress(response.data);
}

async function forwardGeocode(city) {
  const params = new URLSearchParams({
    key: iqToken,
    city,
    format: "json",
    addressdetails: "1",
  });
  try {
    const response = await getWithRateLimitRetry(
      `https://us1.locationiq.com/v1/search?${params.toString()}`,
    );
    const citySort = [...(response.data || [])].sort(
      (a, b) => parseFloat(b.importance) - parseFloat(a.importance),
    );
    return citySort;
  } catch (error) {
    // LocationIQ 404s when nothing matches; treat as no results, not an error.
    if (error.response?.status === 404) {
      return [];
    }
    throw error;
  }
}

app.get("/", (_req, res) => {
  res.json({ message: "ShowFinder API is running", status: "healthy" });
});

// Reports which upstreams are configured (booleans only, never values), so a
// deploy can be verified in one request.
app.get("/api/health", (_req, res) => {
  const configured = {
    locationiq: Boolean(process.env.IQ_TOKEN),
    rapidapi: Boolean(process.env.RAPID_KEY),
    spotify: Boolean(process.env.CLIENT_ID && process.env.CLIENT_SECRET),
    ticketmaster: Boolean(process.env.TICKETMASTER_KEY),
  };
  const ready = configured.locationiq && configured.rapidapi;

  res.status(ready ? 200 : 503).json({
    status: ready ? "healthy" : "misconfigured",
    // Spotify and Ticketmaster only enrich results, so neither blocks readiness.
    ready,
    configured,
    missing: Object.entries(configured)
      .filter(([name, ok]) => !ok && name !== "spotify" && name !== "ticketmaster")
      .map(([name]) => name),
  });
});

/**
 * Fetches from both sources in parallel and merges the results.
 *
 * Ticketmaster is listed first so on a collision the merge prefers it: it
 * supplies venue coordinates, ticket links and Spotify artist ids the
 * aggregator omits. It is optional — a missing key or failure degrades to
 * aggregator-only results rather than failing the request.
 */
async function fetchAndMerge({ cityName, lat, lng, dateRange }) {
  const [aggregator, ticketmaster] = await Promise.allSettled([
    searchMusicEvents({ cityName, dateRange }),
    Number.isFinite(Number(lat)) && Number.isFinite(Number(lng))
      ? searchTicketmasterEvents({ lat, lng, dateRange })
      : Promise.resolve({ data: [], page: null }),
  ]);

  if (aggregator.status === "rejected") throw aggregator.reason;

  const tmData =
    ticketmaster.status === "fulfilled" ? ticketmaster.value.data : [];
  if (ticketmaster.status === "rejected") {
    console.warn("Ticketmaster skipped:", ticketmaster.reason?.message);
  }

  const { data, duplicates } = mergeShows(tmData, aggregator.value.data);
  return {
    data,
    page: aggregator.value.page,
    ticketmaster: { shows: tmData.length, duplicates },
  };
}

/**
 * Tries each name in order and returns the first that yields shows. The
 * upstream rejects some qualified names ("London, United Kingdom" -> error)
 * and mis-resolves borough names ("City of Westminster" -> Sydney).
 */
async function searchShowsForCity(candidateNames, dateRange, coords = {}) {
  const tried = [];
  let lastError = null;

  for (const name of candidateNames) {
    if (!name || tried.includes(name)) continue;
    tried.push(name);
    try {
      const result = await fetchAndMerge({
        cityName: name,
        lat: coords.lat,
        lng: coords.lng,
        dateRange,
      });
      if (result.data.length) return { ...result, locationName: name };
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError && !lastError.upstreamInvalidLocation) throw lastError;
  const empty = { data: [], page: { number: 0, size: 50, totalElements: 0, totalPages: 0, fetched: 0 } };
  try {
    const result = await fetchAndMerge({
      cityName: tried[0],
      lat: coords.lat,
      lng: coords.lng,
      dateRange,
    });
    return { ...result, locationName: tried[0] };
  } catch (error) {
    return { ...empty, locationName: null };
  }
}

/** Strips a trailing region qualifier, e.g. "Westminster, United Kingdom". */
function bareName(name) {
  return String(name || "").split(",")[0].trim();
}

app.get("/api/shows", async (req, res) => {
  try {
    const lat = req.query.lat;
    const lng = req.query.lng;
    if (!hasValidCoords(lat, lng)) {
      return res.status(400).json({
        error: "Valid lat and lng are required (got 0,0 or missing GPS)",
      });
    }

    const currentAddress = await reverseGeocode(lat, lng);
    const address = currentAddress?.address || {};
    // Order matters: the first non-empty result wins, and a borough-qualified
    // name returns wrong shows rather than failing ("City of Westminster" ->
    // Sydney), so the prefix-stripped "Westminster" is tried first.
    const { data, page, locationName } = await searchShowsForCity(
      [
        withoutAdminPrefix(address.city),
        filterCurrentAddress(currentAddress),
        address.city,
        address.state,
      ],
      req.query.dateRange,
      { lat, lng },
    );

    const displayAddress = {
      ...currentAddress,
      address: {
        ...address,
        city: bareName(locationName) || address.city || "",
      },
    };

    res.json({ data, currentAddress: displayAddress, page });
  } catch (error) {
    sendError(res, error);
  }
});

app.get("/api/newshows", async (req, res) => {
  try {
    const newCity = req.query.newCity;
    if (!newCity) {
      return res.status(400).json({ error: "newCity is required" });
    }

    const latLng = await forwardGeocode(newCity);
    if (!latLng.length) {
      return res.json({
        data: [],
        latLng: [],
        page: {
          number: 0,
          size: 50, // matches services/rapidapi PAGE_SIZE
          totalElements: 0,
          totalPages: 0,
          fetched: 0,
        },
      });
    }

    // Widen from "City, Country"/"City, ST" to the bare/typed city.
    const address = normalizeCurrentAddress(latLng[0]).address || {};
    const first = latLng[0] || {};
    const { data, page, locationName } = await searchShowsForCity(
      [filterCurrentAddress({ address }), address.city, address.state, newCity],
      req.query.dateRange,
      { lat: first.lat, lng: first.lon },
    );

    const displayAddress = { address: { ...address, city: bareName(locationName) || address.city || newCity } };
    res.json({ data, latLng: latLng, page, currentAddress: displayAddress });
  } catch (error) {
    sendError(res, error);
  }
});

// Kept so existing clients can warm the token on load; the server now refreshes
// it on its own, so this is no longer required for previews to work.
app.post("/api/spotifyauth", async (_req, res) => {
  try {
    await spotify.getToken();
    res.sendStatus(200);
  } catch (error) {
    console.error("Spotify auth error:", error.message);
    res.status(500).send("Error: " + error.message);
  }
});

/**
 * Resolves the headliner to a Spotify artist and returns its top tracks.
 * `aliases` carries the other provider's spelling of the same act (pipe
 * separated), which is what rescues names like a Ticketmaster tour title.
 */
app.get("/api/spotifysample", async (req, res) => {
  try {
    const aliases = String(req.query.aliases || "")
      .split("|")
      .map((alias) => alias.trim())
      .filter(Boolean);
    const { artist, tracks } = await spotify.findArtistPreview(
      req.query.artist,
      aliases,
    );
    res.json({ artist, tracks });
  } catch (error) {
    console.error("Spotify API Error:", error.message);
    res.status(500).send("Error: " + error.message);
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port} `);
});
