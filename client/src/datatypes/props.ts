import { UserDataState } from "./userData";
import { GeoLocationState } from "../datatypes/locationData";
import { ShowData, ShowDataState } from "../datatypes/showData";
import {
  SetStateAction,
  MouseEventHandler,
  Dispatch,
  MutableRefObject,
} from "react";

export interface TitleProps {
  currCity: string;
  transition: {
    opacity: number;
    type: string;
  };
  isFirstRender: boolean;
  geolocation: GeoLocationState;
}

export interface ContainerProps extends ShowMarkersProps {
  geolocation: GeoLocationState;
  audioRef: MutableRefObject<HTMLAudioElement | null>;
  userData: UserDataState;
  currCity: string;
}

export interface ShowMarkersProps {
  shows: ShowDataState;
  audioLink: string;
  audioRef: MutableRefObject<HTMLAudioElement | null>;
  newAudio: boolean;
  isPlaying: boolean;
  setArtist: Dispatch<SetStateAction<string>>;
  setIsMarkerClicked: Dispatch<SetStateAction<boolean>>;
  setNewAudio: Dispatch<SetStateAction<boolean>>;
}

export interface PopUpProps extends MarkerPlayerProps {
  index: number;
  show: ShowData;
}

export interface MarkerPlayerProps {
  audioLink: string;
  audioRef: MutableRefObject<HTMLAudioElement | null>;
  newAudio: boolean;
  isPlaying: boolean;
}

export interface ControlsTopProps {
  setUserData: Dispatch<SetStateAction<UserDataState>>;
  handleNewCityShows: () => void;
  handleDateRangeShows: () => void;
  handleCurrLocation: () => void;
}

export interface ControlsBottomProps extends BottomProps {
  isMarkerClicked: boolean;
  isAutoPlay: boolean;
  setIsAutoplay: Dispatch<SetStateAction<boolean>>;
  setUserData: Dispatch<SetStateAction<UserDataState>>;
  handleDateRangeShows: () => void;
}

export interface BottomPlayerProps extends BottomProps {
  isMarkerClicked: boolean;
  isAutoPlay: boolean;
  setIsAutoplay: Dispatch<SetStateAction<boolean>>;
}

export type BottomProps = {
  audioRef: MutableRefObject<HTMLAudioElement | null>;
  audioLink: string;
  newAudio: boolean;
  isPlaying: boolean;
  setIsPlaying: Dispatch<SetStateAction<boolean>>;
};

export interface DateRangeProps {
  setUserData: Dispatch<SetStateAction<UserDataState>>;
}

export interface DateButtonInputProps {
  value?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}
