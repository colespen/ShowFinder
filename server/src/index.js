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
  let currCity;
  let userData = {
    date: req.body.date,
    lat: req.body.lat,
    lng: req.body.lng,
  };

  const getShows = (cityName) => {
    const options = {
      method: 'GET',
      baseURL: 'https://concerts-artists-events-tracker.p.rapidapi.com/location',
      params: {
        'name': cityName,
        'minDate': userData.date,
        'maxDate': userData.date,
      },
      headers: {
        'X-RapidAPI-Key': rapidKey,
        'X-RapidAPI-Host': 'concerts-artists-events-tracker.p.rapidapi.com'
      }
    };
    axios.request(options)
      .then(response => {
        console.log("response.data~~~~: ", response.data);
        res.send(response.data);
      })
      .catch(err => {
        console.error(err.message);
      });
  };

  if (userData) axios.get(
    `https://us1.locationiq.com/v1/reverse.php?key=${iqToken}&lat=`
    + userData.lat + "&lon=" + userData.lng + "&format=json"
  )
    .then(response => {
      currCity = response.data.address.city;
      getShows(currCity);
      console.log("currCity in Server~~~: ", currCity);
    })
    .catch(err => {
      console.error(err.message);
    });


  // if (currCity) axios.request(options)
  //   .then(response => {
  //     res.json(response.data);
  //     console.log("response.data~~~~: ", response.data);
  //   })
  //   .catch(err => {
  //     console.error(err.message);
  //   });


  console.log("userData in Server~~~~~: ", userData);
});

// Get Current City
// const xhr = new XMLHttpRequest();
// if (userData) {
//   xhr.open('GET',
//     `https://us1.locationiq.com/v1/reverse.php?key=${process.env.IQ_TOKEN}&lat=`
//     + userData.lat + "&lon=" + userData.lng + "&format=json", true);
//   xhr.send();
//   xhr.onreadystatechange = processRequest;
//   xhr.addEventListener("readystatechange", processRequest, false);
// }
// function processRequest(e) {
//   if (xhr.readyState === 4 && xhr.status === 200) {
//     const response = JSON.parse(xhr.responseText);
//     currCity = response.address.city;
//     console.log("currCity~~~~~~~~~~: ", currCity);
//   }
// }




// app.get('/', (request, response) => {
//   axios.request(options)
//     .then(res => {
//       response.json(res.data);
//       console.log("res.data~~~~~~~~~: ", res.data);
//     })
//     .catch(err => {
//       console.error(err.message);
//     });
// });

let port = process.env.PORT || 8001;
app.listen(port, () => {
  console.log(`Server listening on port ${port} `);
});