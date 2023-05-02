import axios from "axios";
import ENV from "../environment.js";
import Debug from "debug";
import moment, { Moment } from "moment";

const debug = Debug('sf-api:service:ticketmaster');

class TicketMasterService {
  static async eventSearch(geoPoint: string, dateStart?: Moment, dateEnd?: Moment) {
    if (dateStart && !moment.isMoment(dateStart)) {
      throw new Error('sf-api:service:ticketmaster:dateStart:invalid');
    }
    if (dateEnd && !moment.isMoment(dateEnd)) {
      throw new Error('sf-api:service:ticketmaster:dateEnd:invalid');
    }
    if (!dateStart) {
      dateStart = moment.utc();
    }
    if (!dateEnd) {
      dateEnd = moment.utc().add(1, 'day');
    }
    dateStart.set('hour', 0);
    dateStart.set('minute', 0);
    dateStart.set('second', 0);
    dateEnd.set('hour', 23);
    dateEnd.set('minute', 59);
    dateEnd.set('second', 59);

    const eventSearchURL = `https://app.ticketmaster.com/discovery/v2/events.json?`
      + `apikey=${ENV.TICKERMASTER_KEY}`
      + `&geoPoint=${geoPoint}`
      + `&startDateTime=${dateStart.toISOString().split('.')[0]}Z`
      + `&endDateTime=${dateEnd.toISOString().split('.')[0]}Z`;
    debug(eventSearchURL);

    try {
      const eventResult = await axios.get(eventSearchURL);
      return eventResult;
    } catch(e: any) {
      for (let err of e.response.data.errors) {
        console.log(err);
      }
      throw new Error(e);
    }
  }
}

export default TicketMasterService;
