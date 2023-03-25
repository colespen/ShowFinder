import { SetStateAction } from "react";
import { UserDataState } from "./userData";
import { CurrentAddress, ShowData, ShowDataState } from "./showData";
import { GeoLocationState } from "./locationData";

export interface GetShowsArgs {
  userData: UserDataState;
  geolocation: GeoLocationState;
  setShows: (state: ShowDataState) => void;
  setCurrCity: (state: string) => void;
  setUserData: (value: SetStateAction<UserDataState>) => void;
}

export interface SetShowCityUserDataArgs {
  data: {
    currentAddress: CurrentAddress;
    data: ShowData[];
    page: number;
  };
  setShows: (state: ShowDataState) => void;
  setCurrCity: (state: string) => void;
  setUserData: (value: SetStateAction<UserDataState>) => void;
}

export interface getCurrLocationShowsArgs {
  setShows: (state: ShowDataState) => void;
  setCurrCity: (state: string) => void;
  setTransition: (state: { opacity: number; type: string }) => void;
  setUserData: (value: SetStateAction<UserDataState>) => void;
  geolocation: GeoLocationState;
  userData: UserDataState;
}

export interface getNewCityShowsRequestArgs {
  setShows: (state: ShowDataState) => void;
  setCurrCity: (state: string) => void;
  setTransition: (state: { opacity: number; type: string }) => void;
  setUserData: (value: SetStateAction<UserDataState>) => void;
  userData: UserDataState;
  setCityQuery: (state: string) => void;
}

export interface getNewDateRangeShowsArgs {
  setShows: (state: ShowDataState) => void;
  currCity: string;
  setCurrCity: (state: string) => void;
  setTransition: (state: { opacity: number; type: string }) => void;
  setUserData: (value: SetStateAction<UserDataState>) => void;
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
  setCityQuery: (state: string) => void;
  handleNewCityShowsRequest: () => getNewCityShowsRequestArgs;
}