import express from "express";
import Geohash from "latlon-geohash";
import Debug from "debug";
import TicketMasterService from "../services/ticketmaster.service.js";
import createError from "http-errors";
import moment from "moment";

const debug = Debug("sf-api:route:shows");
const router = express.Router();
const rootRoute = "/shows";

/** query shows based on search terms
 */
router.get(`${rootRoute}`, async (req, res, next) => {
  try {
    // if no date range was provided, then set defaults
    const dateStart =
      (req.query?.dateStart && moment.utc(req.query.dateStart as string)) ||
      moment.utc();
    const dateEnd =
      (req.query?.dateEnd && moment.utc(req.query.dateEnd as string)) ||
      moment.utc().add(1, "day");

    const geoPoint = Geohash.encode(
      Number(req.query.lat),
      Number(req.query.lng),
      9
    );
    console.log("geoPoint: ", geoPoint)
    const [sentDateStart, sentDateEnd, events] =
    // const all =
      await TicketMasterService.eventSearch(geoPoint, dateStart, dateEnd);

      res.send({
        geoPoint,
        sentDateStart,
        sentDateEnd,
        events,
      });
    // res.send(all);
  } catch (e: any) {
    if (e?.message == "Invalid geohash") {
      next(createError(417, "query paramaters 'lat' or 'lng' missing"));
      return;
    }
    if (e?.message == "sf-api:service:ticketmaster:dateEnd:beforeDateStart") {
      next(createError(400, "the end date can not be before the start date"));
      return;
    }
    next(e);
  }
});
// ----------------------------------------

export { router };
