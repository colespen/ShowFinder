// this will change if API endpoint changes
// (curretnly LocationIQ + RapidApi

export type Performer = {
  "@type": string;
  name: string;
};

export interface ShowData {
  "@context": string;
  "@type": string;
  description: string;
  endDate: string;
  eventStatus: string;
  image: string;
  location: { [key: string]: any };
  name: string;
  performer: Performer[];
  startDate: string;
}

export interface CurrentAddress {
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
}

export interface ShowDataState {
  currentAddress: CurrentAddress | {};
  data: ShowData[];
  page: number;
}
