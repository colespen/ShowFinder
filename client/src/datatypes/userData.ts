import { CurrentAddress } from "./showData";

export interface UserDataState {
  dateRange: { 
    maxDate: string;
    minDate: string;
  };
  lat: number | null; //might have to change to string
  lng: number | null; //might have to change to string
  currentAddress: CurrentAddress | {};
  newCity: string;
}