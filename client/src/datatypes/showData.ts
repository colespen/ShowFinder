export type Performer = {
  name: string;
  ticketmasterId?: string;
  spotifyArtistId?: string;
  spotifyUrl?: string;
  website?: string;
};

export interface Venue {
  name: string;
  url?: string;
  city?: string;
  latitude: number | null;
  longitude: number | null;
}

export interface ShowPage {
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  fetched: number;
}

export interface ShowData {
  id: string;
  name: string;
  startDate: string;
  image?: string;
  ticketUrl?: string;
  venue: Venue;
  performers: Performer[];
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
  page: ShowPage | number;
}
