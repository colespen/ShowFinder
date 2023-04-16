import express from 'express';
import axios from 'axios';
import Geohash from 'latlon-geohash';
import Debug from 'debug';
import { URLSearchParams } from 'url';
import ENV from '../environment.js';
import TicketMasterService from '../services/ticketmaster.service.js';

const debug = Debug('sf-api:auth');
const router = express.Router();

/** query shows based on search terms
 */
router.get('/api/shows', async (req, res) => {

  debug(`lat: ${req.body.lat}`);
  debug(`lng: ${req.body.lng}`);

  const params = new URLSearchParams({
    key: ENV.LOCATION_IQ_TOKEN,
    lat: req.body.lat,
    lon: req.body.lng,
    format: 'json',
  });

  const locationResults = await axios.get(`https://us1.locationiq.com/v1/reverse?${params.toString()}`);
  const geoPoint = Geohash.encode(req.body.lat, req.body.lng, 9);
  const events = await TicketMasterService.eventSearch(geoPoint);
  console.log(events.data);

  res.send({
    location: locationResults.data.display_name,
    geoPoint,
    events: events.data,
  });
    // .then((response) => {
    //   const currentAddress = response.data;
    //   console.log(
    //     "api/shows - currentAddress.address: ", currentAddress.address.city,
    //     currentAddress.address.country
    //   );

    //   const params = new URLSearchParams({
    //     name: currentAddress.address.country ?
    //       currentAddress.address.city + ", " + currentAddress.address.country :
    //       currentAddress.address.city,
    //     // ...req.query.dateRange
    //   });

    //   // console.log("/api/shows rapidapi params: ", params);

    //   return axios.get(
    //     'https://concerts-artists-events-tracker.p.rapidapi.com/location?'
    //     + params.toString(), {
    //     headers: {
    //       "X-RapidAPI-Key": rapidKey,
    //       "X-RapidAPI-Host": 'concerts-artists-events-tracker.p.rapidapi.com'
    //     }
    //   })
    //     .then((response) => ({ ...response.data, currentAddress }));
    // })
    // .then((data) => {
    //   res.send(data);
    // })
    // .catch((error) => {
    //   res.status(500).send("Error: " + error.message);
    //   console.error("Error: ", error.message);
    // });
});
// ----------------------------------------

export { router };
