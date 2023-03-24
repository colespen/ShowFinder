export interface GeoLocationState {
  loaded: boolean;
  coords: { lat: number; lng: number };
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