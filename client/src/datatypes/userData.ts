export interface UserDataState {
  dateRange: { 
    maxDate: string;
    minDate: string;
  };
  lat: string | null;
  lng: string | null;
  currentAddress: { [key: string]: string };
  newCity: string;
}