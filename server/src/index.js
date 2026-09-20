const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
const axios = require("axios");

dotenv.config();

const { searchMusicEvents } = require("./services/rapidapi");
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
  const response = await axios.get(
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
    const response = await axios.get(
      `https://us1.locationiq.com/v1/search?${params.toString()}`,
    );
    const citySort = [...(response.data || [])].sort(
      (a, b) => parseFloat(b.importance) - parseFloat(a.importance),
    );
    return citySort;
  } catch (error) {
    // LocationIQ returns 404 when nothing matches the city query;
    // treat that as "no results" rather than a server error.
    if (error.response?.status === 404) {
      return [];
    }
    throw error;
  }
}

app.get("/", (_req, res) => {
  res.json({ message: "ShowFinder API is running", status: "healthy" });
});

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
    const cityName = filterCurrentAddress(currentAddress);
    const { data, page } = await searchMusicEvents({
      cityName,
      dateRange: req.query.dateRange,
    });

    res.json({ data, currentAddress, page });
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
          size: 50,
          totalElements: 0,
          totalPages: 0,
          fetched: 0,
        },
      });
    }

    // Disambiguate using the geocoded result ("Portland, OR") so ambiguous
    // city names don't resolve to the wrong city in RapidAPI's geocoder.
    const resolvedCity =
      filterCurrentAddress(normalizeCurrentAddress(latLng[0])) || newCity;

    const { data, page } = await searchMusicEvents({
      cityName: resolvedCity,
      dateRange: req.query.dateRange,
    });

    res.json({ data, latLng, page });
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
