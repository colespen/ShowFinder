const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
const axios = require("axios");
// const path = require("path");

const app = express();

var corsOptions = {
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  optionsSuccessStatus: 200,
};
////   (cors w no config accepts all origins/headers)
app.use(cors(corsOptions));

dotenv.config();

app.use(morgan("tiny"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/////   serve static build files: dev ******
// app.use(express.static(path.resolve(__dirname, "../../client/build")));

const dedupe = require("./utils/dedupe");
const filterCurrentAddress = require("./utils/currAddressFilter");

let port = process.env.PORT || 8001;
const iqToken = process.env.IQ_TOKEN;
const rapidKey = process.env.RAPID_KEY;
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
let spotifyToken = null;

//////////////////////////////////////////////////////////
////    Root route for health check
////////////////////////////////////////////////////////

app.get("/", (req, res) => {
  res.json({ message: "ShowFinder API is running", status: "healthy" });
});

//////////////////////////////////////////////////////////
////    GET - Shows
////////////////////////////////////////////////////////

app.get("/api/shows", (req, res) => {
  const params = new URLSearchParams({
    key: iqToken,
    lat: req.query.lat,
    lon: req.query.lng,
    format: "json",
  });
  axios
    .get(`https://us1.locationiq.com/v1/reverse?${params.toString()}`)
    .then((response) => {
      const currentAddress = response.data;

      // TODO: fix bug, of no matches for rapid api data then nothign return.
      const filteredAddress = filterCurrentAddress(currentAddress);

      const params = new URLSearchParams({
        name: filteredAddress,
        ...req.query.dateRange,
      });
      console.log({ params });
      return axios
        .get(
          "https://concerts-artists-events-tracker.p.rapidapi.com/location?" +
            params.toString(),
          {
            headers: {
              "X-RapidAPI-Key": rapidKey,
              "X-RapidAPI-Host":
                "concerts-artists-events-tracker.p.rapidapi.com",
            },
          },
        )
        .then((response) => ({ ...response.data, currentAddress }));
    })
    .then((data) => {
      // console.log("api/shows - data: ", data);
      res.send(data);
    })
    .catch((error) => {
      res.status(500).send("Error: " + error.message);
      console.error("Error: ", error.message);
    });
});

//////////////////////////////////////////////////////////
////    GET - New Shows
////////////////////////////////////////////////////////

app.get("/api/newshows", (req, res) => {
  const params = new URLSearchParams({
    key: iqToken,
    city: req.query.newCity,
    format: "json",
  });
  axios
    .get(`https://us1.locationiq.com/v1/search?${params.toString()}`)
    .then((response) => {
      // TODO: abstract citySort
      const citySort = response.data.sort(
        (a, b) => parseFloat(b.importance) - parseFloat(a.importance),
      );
      const latLng = citySort;

      const params = new URLSearchParams({
        name: req.query.newCity,
        ...req.query.dateRange,
      });
      return axios
        .get(
          "https://concerts-artists-events-tracker.p.rapidapi.com/location?" +
            params.toString(),
          {
            headers: {
              "X-RapidAPI-Key": rapidKey,
              "X-RapidAPI-Host":
                "concerts-artists-events-tracker.p.rapidapi.com",
            },
          },
        )
        .then((response) => {
          const deduped = dedupe(response);
          return { data: [...deduped], latLng };
        });
    })
    .then((data) => {
      res.send(data);
    })
    .catch((error) => {
      res.status(500).send("Error: " + error.message);
      console.error("Error: ", error.message);
    });
});

//////////////////////////////////////////////////////////
////    POST - Auth Request
////////////////////////////////////////////////////////

app.post("/api/spotifyauth", (req, res) => {
  const base64ID = new Buffer.from(client_id + ":" + client_secret).toString(
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

//////////////////////////////////////////////////////////
////    Get - Artist ID -> Top Single
////////////////////////////////////////////////////////

app.get("/api/spotifysample", async (req, res) => {
  try {
    // search for artist
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

    // get top tracks
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
        // log but continue processing other tracks
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
