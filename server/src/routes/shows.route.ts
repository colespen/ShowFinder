import express from 'express';
import Geohash from 'latlon-geohash';
import Debug from 'debug';
import TicketMasterService from '../services/ticketmaster.service.js';
import createError from 'http-errors';

const debug = Debug('sf-api:route:shows');
const router = express.Router();
const rootRoute = '/shows';

/** query shows based on search terms
 */
router.get(`${rootRoute}`, async (req, res, next) => {
  try {
    const geoPoint = Geohash.encode(Number(req.query.lat), Number(req.query.lng), 9);
    const events = await TicketMasterService.eventSearch(geoPoint);
    res.send({
      geoPoint,
      events: events.data,
    });
  } catch(e: any) {
    const msg = e?.message?.toLowerCase();
    if (msg == 'invalid geohash') {
      next(createError(417, 'query paramaters \'lat\' or \'lng\' missing'));
      return;
    }
    next(e);
  }
});
// ----------------------------------------

export { router };
