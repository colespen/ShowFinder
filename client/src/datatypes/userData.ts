import { CurrentAddress } from "./showData";

export interface UserDataState {
  dateRange: DateRangeType;
  lat: number; //might have to change to string
  lng: number; //might have to change to string
  currentAddress: CurrentAddress;
  newCity: string;
}

export type DateRangeType = {
  maxDate: string;
  minDate: string;
}