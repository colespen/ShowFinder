// this will change if API endpoint changes
// (curretnly LocationIQ + RapidApi

export interface ShowDataState {

  currentAddress: {
    address: { [key: string]: string };
    boundingbox: string[];
    display_name: string;
    importance: number;
    lat: string;
    licence: string;
    lon: string;
    osm_id: string;
    osm_type: string;
    place_id: string;
  } | {};

  data: {
    "@context": string;
    "@type": string;
    description: string;
    endDate: string;
    eventStatus: string;
    image: string;
    location: { [key: string]: any };
    name: string;
    performer: {
      "@type": string;
      name: string;
    }[];
    startDate: string;
  }[];
  
  page: number;
}
