import { SetStateAction, Dispatch } from "react";
import { UserDataState } from "./userData";
import { CurrentAddress, ShowData, ShowDataState } from "./showData";
import { GeoLocationState } from "./locationData";

export type ShowCallbackArgs = {
  setShows: Dispatch<SetStateAction<ShowDataState>>;
  setCurrCity: Dispatch<SetStateAction<string>>;
  setUserData: Dispatch<SetStateAction<UserDataState>>;
};

export interface GetShowsArgs {
  userData: UserDataState;
  geolocation: GeoLocationState;
  callbacks: ShowCallbackArgs;
}

export interface SetShowCityUserDataArgs {
  data: {
    currentAddress: CurrentAddress;
    data: ShowData[];
    page: number;
  };
  callbacks: ShowCallbackArgs;
}

export interface SetNewShowCityUserDataArgs {
  data: {
    currentAddress: CurrentAddress;
    data: ShowData[];
    page: number;
    latLng: [
      {
        lat: number;
        lon: number;
      },
    ];
  };
  cityQuery: string;
  callbacks: ShowCallbackArgs;
}

export interface GetCurrLocationShowsArgs {
  userData: UserDataState;
  geolocation: GeoLocationState;
  callbacks: ShowCallbackArgs & {
    setTransition: Dispatch<SetStateAction<{ opacity: number; type: string }>>;
  };
}

export interface GetNewCityShowsArgs {
  userData: UserDataState;
  callbacks: ShowCallbackArgs & {
    setTransition: Dispatch<SetStateAction<{ opacity: number; type: string }>>;
    setCityQuery: Dispatch<SetStateAction<string>>;
  };
}

export interface GetNewDateRangeShowsArgs {
  userData: UserDataState;
  currCity: string;
  cityQuery: string;
  callbacks: ShowCallbackArgs & {
    setTransition: Dispatch<SetStateAction<{ opacity: number; type: string }>>;
    setCityQuery: Dispatch<SetStateAction<string>>;
    handleNewCityShows: () => void;
  };
}
