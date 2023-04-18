export type Coords = {
  lat: number; 
  lng: number;
}

export interface GeoLocationState {
  loaded: boolean;
  coords: Coords;
  accuracy: number;
  error?: {
    code: number;
    message: string;
  };
  access: boolean;
  isClick: boolean;
}

export interface onSuccessGeo {
  coords: {
    accuracy: number;
    latitude: number;
    longitude: number;
  };
}