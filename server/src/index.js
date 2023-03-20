const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
////    cors no config accepts all origins/headers
app.use(cors());

dotenv.config();

app.use(morgan('tiny'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/////   serve static files for build ******
app.use(express.static(path.resolve(__dirname, '../../client/build')));

let port = process.env.PORT || 8001;

const iqToken = process.env.IQ_TOKEN;
const rapidKey = process.env.RAPID_KEY;
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
let spotifyToken = null;


//////////////////////////////////////////////////////////
////    GET - Shows
////////////////////////////////////////////////////////

app.get('/api/shows', (req, res) => {
  const params = new URLSearchParams({
    key: iqToken,
    lat: req.query.lat,
    lon: req.query.lng,
    format: 'json'
  });
  axios.get(
    `https://us1.locationiq.com/v1/reverse?${params.toString()}`
  )
    .then((response) => {
      const currentAddress = response.data;
      console.log("api/shows - currentAddress: ", currentAddress);

      const params = new URLSearchParams({
        // TODO: this city name might change from orig. city query (/newshows)
        // for example, London -> City of Westminister with geo coords reverse
        name: currentAddress.address.city,
        ...req.query.dateRange
      });
      return axios.get(
        'https://concerts-artists-events-tracker.p.rapidapi.com/location?'
        + params.toString(), {
        headers: {
          "X-RapidAPI-Key": rapidKey,
          "X-RapidAPI-Host": 'concerts-artists-events-tracker.p.rapidapi.com'
        }
      })
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

app.get('/api/newshows', (req, res) => {
  const params = new URLSearchParams({
    key: iqToken,
    city: req.query.newCity,
    format: 'json'
  });
  axios.get(
    `https://us1.locationiq.com/v1/search?${params.toString()}`
  )
    .then(response => {

      const citySort =
        response.data.sort((a, b) =>
          parseFloat(b.importance) - parseFloat(a.importance));
      const latLng = citySort;

      const params = new URLSearchParams({
        name: req.query.newCity,
        ...req.query.dateRange
      });
      return axios.get(
        'https://concerts-artists-events-tracker.p.rapidapi.com/location?'
        + params.toString(), {
        headers: {
          "X-RapidAPI-Key": rapidKey,
          "X-RapidAPI-Host": 'concerts-artists-events-tracker.p.rapidapi.com'
        }
      })
        .then(response => {
          // TODO: this dedupe stil retains some dupes resulting in same keys
          const dedupe =
            response?.data?.data?.filter((el, index, arr) =>
              index === arr.findIndex((x) =>
                (x.description === el.description && x.startDate === el.startDate)
              )) || [];
          return { data: [...dedupe], latLng };
        });
    })
    .then(data => {
      console.log("data (shows) ~~~~: ", data);
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

app.post('/api/spotifyauth', (req, res) => {
  const base64ID = new Buffer.from(client_id + ':' + client_secret).toString('base64');
  console.log("*** base64Id: ", base64ID);
  const config = {
    headers: {
      'Authorization': 'Basic ' + base64ID,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };
  const data = 'grant_type=client_credentials';

  axios.post('https://accounts.spotify.com/api/token', data, config)
    .then((response) => {
      spotifyToken = response.data.access_token;
      res.sendStatus(200);
      console.log("*** /api/spotifyauth response.data: ", response.data);
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

app.get('/api/spotifysample', (req, res) => {
  console.log("********* /api/spotifysample req.query.artist: ", req.query.artist);
  const params = new URLSearchParams({
    q: req.query.artist,
    type: 'artist',
    format: 'json'
  });
  axios.get(`https://api.spotify.com/v1/search?${params.toString()}`, {
    headers: {
      Authorization: 'Bearer ' + spotifyToken
    }
  })
    .then((response) => {
      const params = new URLSearchParams({
        market: 'US',
        format: 'json'
      });
      const artistId = response.data.artists.items[0].id;
      console.log("artistId: ", artistId);
      return axios.get(
        `https://api.spotify.com/v1/artists/${artistId}/top-tracks?${params.toString()}`, {
        headers: {
          Authorization: 'Bearer ' + spotifyToken
        }
      })
        .then((response) => {
          const topTrack = response.data.tracks[0].preview_url;
          return { topTrack };
        });
    })
    .then((data) => {
      console.log("data in /api/spotifysample: ", data);
      res.send(data);
    })
    .catch((error) => {
      res.status(500).send("Error: " + error.message);
      console.error("Error: ", error.message);
    });
});

// get artist id
// https://api.spotify.com/v1/search?q=deerhoof&type=artist
// artists[0].item.id ("7AZwAitWq1KcFoIJhRWb6V")

// get top single
// https://api.spotify.com/v1/artists/7AZwAitWq1KcFoIJhRWb6V/top-tracks?market=US
//tracks[0].preview_url


app.listen(port, () => {
  console.log(`Server listening on port ${port} `);
});