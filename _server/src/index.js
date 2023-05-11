const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
const axios = require("axios");
const path = require("path");

const app = express();
////    cors no config accepts all origins/headers
app.use(cors());

dotenv.config();

app.use(morgan("tiny"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/////   serve static files for build ******
app.use(express.static(path.resolve(__dirname, "../../_client/build")));

const dedupe = require("./utils/dedupe");

let port = process.env.PORT || 8001;
const iqToken = process.env.IQ_TOKEN;
const rapidKey = process.env.RAPID_KEY;
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
let spotifyToken = null;

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
      console.log(
        "api/shows - currentAddress.address: ",
        currentAddress.address.city,
        currentAddress.address.country
      );
      const params = new URLSearchParams({
        name: currentAddress.address.country
          ? currentAddress.address.city + ", " + currentAddress.address.country
          : currentAddress.address.city,
        ...req.query.dateRange,
      });
      // console.log("/api/shows rapidapi params: ", params);
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
          }
        )
        .then((response) => ({ ...response.data, currentAddress }));
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
        (a, b) => parseFloat(b.importance) - parseFloat(a.importance)
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
          }
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
    "base64"
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
      console.log("*** spotifyToken: ", spotifyToken);
    })
    .catch((error) => {
      res.status(500).send("Error: " + error.message);
      console.error("Error: ", error.message);
    });
});

//////////////////////////////////////////////////////////
////    Get - Artist ID -> Top Single
////////////////////////////////////////////////////////

app.get("/api/spotifysample", (req, res) => {
  console.log(
    "********* /api/spotifysample req.query.artist: ",
    req.query.artist
  );
  const params = new URLSearchParams({
    q: req.query.artist,
    type: "artist",
    format: "json",
  });
  axios
    .get(`https://api.spotify.com/v1/search?${params.toString()}`, {
      headers: {
        Authorization: "Bearer " + spotifyToken,
      },
    })
    .then((response) => {
      const params = new URLSearchParams({
        market: "US",
        format: "json",
      });
      const artistsItems = response.data.artists.items;
      if (artistsItems.length === 0 || !Array.isArray(artistsItems)) {
        return Promise.resolve({ tracks: [] });
      } else {
        const artistId = artistsItems[0].id;
        return axios
          .get(
            `https://api.spotify.com/v1/artists/${artistId}/top-tracks?${params.toString()}`,
            {
              headers: {
                Authorization: "Bearer " + spotifyToken,
              },
            }
          )
          .then((response) => {
            const tracks = response.data.tracks;
            return { tracks };
          });
      }
    })
    .then((data) => {
      console.log("data: ", data);
      res.send(data);
    })
    .catch((error) => {
      res.status(500).send("Error: " + error.message);
      console.error("Error: ", error.message);
    });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port} `);
});
