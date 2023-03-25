import { GeoLocationState } from "./locationData";

export interface TitleProps {
  currCity: string
  transition: {
    opacity: number;
    type: string;
  };
  isFirstRender: boolean;
  geolocation: GeoLocationState;
}