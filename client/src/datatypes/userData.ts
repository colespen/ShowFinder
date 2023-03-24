import { CurrentAddress } from "./showData";

export interface UserDataState {
  dateRange: { 
    maxDate: string;
    minDate: string;
  };
  lat: number; //might have to change to string
  lng: number; //might have to change to string
  currentAddress: CurrentAddress | {};
  newCity: string;
}