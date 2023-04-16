import axios from 'axios';
import ENV from '../environment.js';

const ticketMasterBaseURL = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${ENV.TICKERMASTER_KEY}`;

class TicketMasterService {

  static async eventSearch(geoPoint: string) {
    const eventResult = await axios.get(`${ticketMasterBaseURL}&geoPoint=${geoPoint}`);
    return eventResult
  }

  static test() {

  }

}

export default TicketMasterService;
