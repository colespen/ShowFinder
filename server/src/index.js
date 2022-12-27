const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const axios = require('axios');

const app = express();
dotenv.config();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send('nothing here');
});

const iqToken = process.env.IQ_TOKEN;
const rapidKey = process.env.RAPID_KEY;


app.post('/', (req, res) => {
  let userData = {
    dateRange: {
      minDate: req.body.dateRange.minDate, 
      maxDate: req.body.dateRange.maxDate
    },
    lat: req.body.lat,
    lng: req.body.lng,
  };
  
  const getCity = () => {
    if (userData) axios.get(
      `https://us1.locationiq.com/v1/reverse.php?key=${iqToken}&lat=`
      + userData.lat + "&lon=" + userData.lng + "&format=json"
    )
      .then(response => {
        console.log("response.data in getCity~~~: ", response.data);
        //response.data is current city
        getShows(response.data);
      })
      .catch(err => {
        console.error(err.message);
      });
  }
  getCity();

  const getShows = (currAddress) => {
    const options = {
      method: 'GET',
      baseURL: 'https://concerts-artists-events-tracker.p.rapidapi.com/location',
      params: {
        'name': currAddress.address.city,
        'minDate': userData.dateRange.minDate,
        'maxDate': userData.dateRange.maxDate,
      },
      headers: {
        'X-RapidAPI-Key': rapidKey,
        'X-RapidAPI-Host': 'concerts-artists-events-tracker.p.rapidapi.com'
      }
    };
    axios.request(options)
      .then(response => {
        console.log("response.data in getShows~~: ", response.data);
        res.send({...response.data, currAddress});
      })
      .catch(err => {
        console.error(err.message);
      });
  };

  console.log("userData~~~~~: ", userData);
});


let port = process.env.PORT || 8001;
app.listen(port, () => {
  console.log(`Server listening on port ${port} `);
});