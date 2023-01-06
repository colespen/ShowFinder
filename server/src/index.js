const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const axios = require('axios');
const path = require('path');


const app = express();
dotenv.config();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/////   serve static files for build
app.use(express.static(path.resolve(__dirname, '../../client/build')));

let port = process.env.PORT || 8001;

const iqToken = process.env.IQ_TOKEN;
const rapidKey = process.env.RAPID_KEY;

//////////////////////////////////////////////////////////
////    GET
////////////////////////////////////////////////////////

app.get('/api/shows', (req, res) => {
  const params = new URLSearchParams({
    key: iqToken,
    lat: req.query.lat,
    lon: req.query.lng,
    format: 'json'
  });

  axios.get(
    `https://us1.locationiq.com/v1/reverse.php?${params.toString()}`
  ).then((response) => {
    const currentAddress = response.data;
    const params = new URLSearchParams({
      name: currentAddress.address.city,
      ...req.query.dateRange
    });

    return axios.get('https://concerts-artists-events-tracker.p.rapidapi.com/location?' + params.toString(), {
      headers: {
        "X-RapidAPI-Key": rapidKey,
        "X-RapidAPI-Host": 'concerts-artists-events-tracker.p.rapidapi.com'
      }
    })
      .then((response) => ({ ...response.data, currAddress: currentAddress }));
  }).then((data) => {
    res.send(data);
  })
    .catch((error) => {
      res.status(500).send("Error: " + error.message);
    });
});

//////////////////////////////////////////////////////////
////    PUT
////////////////////////////////////////////////////////

app.put('/', (req, res) => {
  userData = {
    dateRange: {
      minDate: req.body.dateRange.minDate,
      maxDate: req.body.dateRange.maxDate
    },
    newCity: req.body.newCity,
  };

  const getCoords = () => {
    if (userData) axios.get(
      `https://us1.locationiq.com/v1/search?key=${iqToken}&city=${userData.newCity}&format=json`
    )
      .then(response => {
        console.log("response.data in getCoords~~~~~~: ", response.data);
        //response.data is coordinates
        getNewShows(response.data);
      })
      .catch(err => {
        console.error(err.message);
      });
  };
  getCoords();

  const getNewShows = (latLng) => {
    const options = {
      method: 'GET',
      baseURL: 'https://concerts-artists-events-tracker.p.rapidapi.com/location',
      params: {
        'name': userData.newCity,
        'minDate': userData.dateRange.minDate,
        'maxDate': userData.dateRange.maxDate,
      },
      headers: {
        'X-RapidAPI-Key': rapidKey,
        'X-RapidAPI-Host': 'concerts-artists-events-tracker.p.rapidapi.com',
      }
    };
    axios.request(options)
      .then(response => {
        console.log("response.data in getNewShows~~~~~: ", response.data);
        res.json({ ...response.data, latLng });
      })
      .catch(err => {
        console.error(err.message);
      });
  };

});

app.listen(port, () => {
  console.log(`Server listening on port ${port} `);
});