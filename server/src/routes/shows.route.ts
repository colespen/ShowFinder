import express from 'express';
import Geohash from 'latlon-geohash';
import Debug from 'debug';
import TicketMasterService from '../services/ticketmaster.service.js';

const debug = Debug('sf-api:route:shows');
const router = express.Router();

/** query shows based on search terms
 */
router.get('/shows', async (req, res) => {
  const geoPoint = Geohash.encode(req.body.lat, req.body.lng, 9);
  const events = await TicketMasterService.eventSearch(geoPoint);
  res.send({
    geoPoint,
    events: events.data,
  });
});
// ----------------------------------------

export { router };
