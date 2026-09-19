const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
const axios = require("axios");

dotenv.config();

const { searchMusicEvents } = require("./services/ticketmaster");
const { searchArtistPreview } = require("./services/itunes");
const { normalizeCurrentAddress, hasValidCoords } = require("./utils/location");

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
  });
  const response = await axios.get(
    `https://us1.locationiq.com/v1/search?${params.toString()}`,
  );
  const citySort = [...(response.data || [])].sort(
    (a, b) => parseFloat(b.importance) - parseFloat(a.importance),
  );
  return citySort;
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
    const { data, page } = await searchMusicEvents({
      lat,
      lng,
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
          size: 200,
          totalElements: 0,
          totalPages: 0,
          fetched: 0,
        },
      });
    }

    const { data, page } = await searchMusicEvents({
      lat: latLng[0].lat,
      lng: latLng[0].lon,
      dateRange: req.query.dateRange,
    });

    res.json({ data, latLng, page });
  } catch (error) {
    sendError(res, error);
  }
});

app.get("/api/preview", async (req, res) => {
  try {
    const artist = req.query.artist;
    if (!artist) {
      return res.status(400).json({ error: "artist is required" });
    }
    const preview = await searchArtistPreview(artist);
    res.json(preview);
  } catch (error) {
    sendError(res, error);
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port} `);
});
