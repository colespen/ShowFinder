import { UserDataState, DateRangeType } from "./userData";
import { GeoLocationState } from "../datatypes/locationData";
import { ShowDataState } from "../datatypes/showData";
import {
  SetStateAction,
  MouseEventHandler,
  Dispatch,
  MutableRefObject,
} from "react";
import {
  KeyboardEvent,
  ChangeEvent,
  FocusEvent,
} from "./events";

export interface ContainerProps {
  geolocation: GeoLocationState;
  shows: ShowDataState;
  userData: UserDataState;
  currCity: string;
  handleSetArtist: (artist: string) => void;
  audioLink: string;
  newAudio: boolean;
  handlePlayPause: () => void;
  handleSetNewAudio: () => void;
  isPlaying: boolean;
  setIsMarkerClicked: Dispatch<SetStateAction<boolean>>;
}

export interface ControlsTopProps {
  setUserData: Dispatch<SetStateAction<UserDataState>>;
  handleCityChange: (e: ChangeEvent) => void;
  handleInputTextSelect: (e: FocusEvent) => void;
  handleNewCityOnEnter: (e: KeyboardEvent) => void;
  handleNewCityShows: () => void;
  handleDateSelect: (dateRange: DateRangeType) => void;
  handleDateRangeShows: () => void;
  handleCurrLocation: () => void;
}

export interface ControlsBottomProps {
  setUserData: Dispatch<SetStateAction<UserDataState>>;
  handleDateSelect: (dateRange: DateRangeType) => void;
  handleDateRangeShows: () => void;
  audioRef: MutableRefObject<HTMLAudioElement | null>;
  audioLink: string;
  newAudio: boolean;
  handlePlayPause: () => void;
  setIsPlaying: Dispatch<SetStateAction<boolean>>;
  isPlaying: boolean;
  isMarkerClicked: boolean;
}

export interface DateRangeProps {
  handleDateSelect: (dateRange: DateRangeType) => void;
  setUserData: Dispatch<SetStateAction<UserDataState>>;
}

export interface DateButtonInputProps {
  value?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}
