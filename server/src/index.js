const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
const axios = require("axios");

dotenv.config();

const { searchMusicEvents, withoutAdminPrefix } = require("./services/rapidapi");
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
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
let spotifyToken = null;

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
  };
  const ready = configured.locationiq && configured.rapidapi;

  res.status(ready ? 200 : 503).json({
    status: ready ? "healthy" : "misconfigured",
    // Spotify only affects audio previews, so it does not block readiness.
    ready,
    configured,
    missing: Object.entries(configured)
      .filter(([, ok]) => !ok)
      .map(([name]) => name),
  });
});

/**
 * Tries each name in order and returns the first that yields shows. The
 * upstream rejects some qualified names ("London, United Kingdom" -> error)
 * and mis-resolves borough names ("City of Westminster" -> Sydney).
 */
async function searchShowsForCity(candidateNames, dateRange) {
  const tried = [];
  let lastError = null;

  for (const name of candidateNames) {
    if (!name || tried.includes(name)) continue;
    tried.push(name);
    try {
      const result = await searchMusicEvents({ cityName: name, dateRange });
      if (result.data.length) return { ...result, locationName: name };
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError && !lastError.upstreamInvalidLocation) throw lastError;
  const empty = { data: [], page: { number: 0, size: 50, totalElements: 0, totalPages: 0, fetched: 0 } };
  try {
    const result = await searchMusicEvents({ cityName: tried[0], dateRange });
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
    const { data, page, locationName } = await searchShowsForCity(
      [filterCurrentAddress({ address }), address.city, address.state, newCity],
      req.query.dateRange,
    );

    const displayAddress = { address: { ...address, city: bareName(locationName) || address.city || newCity } };
    res.json({ data, latLng: latLng, page, currentAddress: displayAddress });
  } catch (error) {
    sendError(res, error);
  }
});

app.post("/api/spotifyauth", (req, res) => {
  const base64ID = Buffer.from(client_id + ":" + client_secret).toString(
    "base64",
  );
  const config = {
    headers: {
      Authorization: "Basic " + base64ID,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };
  const data = "grant_type=client_credentials";

  axios
    .post("https://accounts.spotify.com/api/token", data, config)
    .then((response) => {
      spotifyToken = response.data.access_token;
      res.sendStatus(200);
    })
    .catch((error) => {
      res.status(500).send("Error: " + error.message);
      console.error("Error: ", error.message);
    });
});

app.get("/api/spotifysample", async (req, res) => {
  try {
    const searchParams = new URLSearchParams({
      q: req.query.artist,
      type: "artist",
      format: "json",
    });

    const searchResponse = await axios.get(
      `https://api.spotify.com/v1/search?${searchParams.toString()}`,
      { headers: { Authorization: "Bearer " + spotifyToken } },
    );

    const artistsItems = searchResponse.data.artists.items;
    if (!artistsItems?.length || !Array.isArray(artistsItems)) {
      return res.send({ tracks: [] });
    }

    const topTracksParams = new URLSearchParams({
      market: "US",
      format: "json",
    });

    const artistId = artistsItems[0].id;
    const topTracksResponse = await axios.get(
      `https://api.spotify.com/v1/artists/${artistId}/top-tracks?${topTracksParams.toString()}`,
      { headers: { Authorization: "Bearer " + spotifyToken } },
    );

    const tracks = topTracksResponse.data.tracks;
    if (!tracks?.length) {
      return res.send({ tracks: [] });
    }

    // process first three tracks - get preview URLs
    // need this hack now that preview_url is null with latest Spotify api changes
    const MAX_TRACKS = 3;
    const slicedTracks = tracks.slice(0, MAX_TRACKS);

    for (let i = 0; i < slicedTracks.length; i++) {
      const trackId = slicedTracks[i].id;
      try {
        const embedResponse = await axios.get(
          `https://open.spotify.com/embed/track/${trackId}`,
          { headers: { "Content-Type": "application/json" } },
        );

        const regex =
          /<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/s;
        const match = embedResponse.data.match(regex);

        if (match) {
          const jsonData = JSON.parse(match[1]);
          if (jsonData?.props?.pageProps?.state?.data?.entity?.audioPreview) {
            slicedTracks[i].preview_url =
              jsonData.props.pageProps.state.data.entity.audioPreview.url;
          }
        }
      } catch (embedError) {
        console.error(
          `Error fetching embed data for track ${i + 1}:`,
          embedError.message,
        );
      }
    }

    return res.send({ tracks: slicedTracks });
  } catch (error) {
    console.error("Spotify API Error:", error.message);
    return res.status(500).send("Error: " + error.message);
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port} `);
});
