import axios from "axios";
import ENV from "../environment.js";
import Debug from "debug";
import moment, { Moment } from "moment";
import { TicketmasterEventData, TicketmasterEventVenue, TicketmasterEventAttraction, TicketmasterEvent } from '../models/ticketmaster.type.js'

const debug = Debug('sf-api:service:ticketmaster');

class TicketMasterService {
  static async eventSearch(geoPoint: string, dateStart: Moment, dateEnd: Moment): Promise<[Moment, Moment, TicketmasterEventData]> {
    if (!moment.isMoment(dateStart)) {
      throw new Error('sf-api:service:ticketmaster:dateStart:invalid');
    }
    if (!moment.isMoment(dateEnd)) {
      throw new Error('sf-api:service:ticketmaster:dateEnd:invalid');
    }
    if (dateEnd.isBefore(dateStart)) {
      throw new Error('sf-api:service:ticketmaster:dateEnd:beforeDateStart');
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
      + `&classificationName=music`
      + `&startDateTime=${dateStart.toISOString().split('.')[0]}Z`
      + `&endDateTime=${dateEnd.toISOString().split('.')[0]}Z`;

    try {
      const eventResult = await axios.get(eventSearchURL);
      const events = this.parseEventData(eventResult.data);
      return [
        dateStart,
        dateEnd,
        events,
      ];
    } catch(e: any) {
      debug(e);
      for (let err of e.response.data.errors) {
        console.log(err);
      }
      throw new Error(e);
    }
  }

  static parseEventData(rawData: any): TicketmasterEventData {
    const events: TicketmasterEventData = [];
    for (let event of rawData?._embedded.events) {
      const parsedVenues: Array<TicketmasterEventVenue> = event._embedded.venues?.map((vnu: any) => {
        const venue: TicketmasterEventVenue = {
          id: vnu.id,
          name: vnu.name,
          url: vnu.url,
        };
        if (vnu?.description) {
          venue.description = vnu.description;
        }
        if (vnu?.address) {
          venue.address = vnu.address;
        }
        if (vnu?.city) {
          venue.city = vnu.city;
        }
        if (vnu?.state) {
          venue.state = vnu.state;
        }
        if (vnu?.location) {
          venue.location = vnu.location;
        }
        return venue;
      });
      const parsedAttractions: Array<TicketmasterEventAttraction> = event._embedded.attractions?.map((att: any) => {
        const attraction: TicketmasterEventAttraction = {
          id: att.id,
          name: att.name,
          url: att.url,
        };
        if (att.externalLinks?.spotify && Array.isArray(att.externalLinks.spotify) && att.externalLinks.spotify.length > 0) {
          const profile = new URL(att.externalLinks?.spotify[0].url);
          const artistId = profile.pathname.split('/');
          attraction.spotify = {
            profileUrl: profile,
          };
          if (artistId[1] == 'artist') {
            attraction.spotify.artistId = artistId[2];
          }
        }
        if (att.externalLinks?.homepage && Array.isArray(att.externalLinks.homepage) && att.externalLinks.homepage.length > 0) {
          attraction.website = new URL(att.externalLinks?.homepage[0].url);
        }
        return attraction;
      });
      const parsedEvent: TicketmasterEvent = {
        id: event.id,
        name: event.name,
        url: new URL(event.url),
        locale: event.locale,
        images: event.images.map((img: any) => ({
          ratio: img?.ratio,
          url: new URL(img.url),
          width: Number(img.width),
          height: Number(img.height),
          fallback: img.fallback,
        })),
        venues: parsedVenues,
        attractions: parsedAttractions,
      };
      events.push(parsedEvent);
    }
    return events;
  }
}

export default TicketMasterService;
