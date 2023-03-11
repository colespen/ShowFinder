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
  // https://us1.locationiq.com/v1/reverse.php? removed .php ***
  axios.get(
    `https://us1.locationiq.com/v1/reverse?${params.toString()}`
  )
    .then((response) => {
      const currentAddress = response.data;

      const params = new URLSearchParams({
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
    ,
    {
      headers: {
        "Content-Type": "application/json",
      }
    }
  )
    .then(response => {
      const citySort =
        response.data.sort((a, b) => parseFloat(b.importance) - parseFloat(a.importance));

      console.log("citySort~~~~~~: ", citySort);
      //  this response.data is entire locationIQ obj incl. coords.
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
        .then(response => ({ ...response.data, latLng }));
    })
    .then(data => {
      console.log("data (shows): ~~~~: ", data);
      res.send(data);
    })
    .catch((error) => {
      res.status(500).send("Error: " + error.message);
    });
});

app.listen(port, () => {
  console.clear();
  console.log(`Server listening on port ${port} `);
});