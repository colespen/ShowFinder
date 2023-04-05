import { SetStateAction, Dispatch } from "react";
import { UserDataState } from "./userData";
import { CurrentAddress, ShowData, ShowDataState } from "./showData";
import { GeoLocationState } from "./locationData";

export interface GetShowsArgs {
  userData: UserDataState;
  geolocation: GeoLocationState;
  setShows: Dispatch<SetStateAction<ShowDataState>>;
  setCurrCity: Dispatch<SetStateAction<string>>;
  setUserData: Dispatch<SetStateAction<UserDataState>>;
}

export interface SetShowCityUserDataArgs {
  data: {
    currentAddress: CurrentAddress;
    data: ShowData[];
    page: number;
  };
  setShows: Dispatch<SetStateAction<ShowDataState>>;
  setCurrCity: Dispatch<SetStateAction<string>>;
  setUserData: Dispatch<SetStateAction<UserDataState>>;
}

export interface GetCurrLocationShowsArgs {
  geolocation: GeoLocationState;
  userData: UserDataState;
  setShows: Dispatch<SetStateAction<ShowDataState>>;
  setCurrCity: Dispatch<SetStateAction<string>>;
  setUserData: Dispatch<SetStateAction<UserDataState>>;
  setTransition: Dispatch<SetStateAction<{ opacity: number; type: string }>>;
}

export interface GetNewCityShowsArgs {
  userData: UserDataState;
  setShows: Dispatch<SetStateAction<ShowDataState>>;
  setCurrCity: Dispatch<SetStateAction<string>>;
  setUserData: Dispatch<SetStateAction<UserDataState>>;
  setTransition: Dispatch<SetStateAction<{ opacity: number; type: string }>>;
  setCityQuery: Dispatch<SetStateAction<string>>;
}

export interface GetNewDateRangeShowsArgs {
  currCity: string;
  userData: {
    dateRange: {
      maxDate: string;
      minDate: string;
    };
    lat: number;
    lng: number;
    currentAddress: CurrentAddress;
    newCity: string;
  };
  cityQuery: string;
  setShows: Dispatch<SetStateAction<ShowDataState>>;
  setCurrCity: Dispatch<SetStateAction<string>>;
  setUserData: Dispatch<SetStateAction<UserDataState>>;
  setTransition: Dispatch<SetStateAction<{ opacity: number; type: string }>>;
  setCityQuery: Dispatch<SetStateAction<string>>;
  handleNewCityShows: () => void;
}
