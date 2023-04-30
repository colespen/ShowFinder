import axios from "axios";
import ENV from "../environment.js";
import Debug from "debug";

const debug = Debug("sf-api:service:ticketmaster");

class TicketMasterService {
  static async eventSearch(geoPoint: string) {
    const eventResult = await axios.get(
      `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${ENV.TICKERMASTER_KEY}&geoPoint=${geoPoint}`
    );
    return eventResult;
  }
}

export default TicketMasterService;
