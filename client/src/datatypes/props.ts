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

export interface ContainerProps {
  geolocation: GeoLocationState;
  shows: ShowDataState;
  userData: UserDataState;
  currCity: string;
  audioLink: string;
  newAudio: boolean;
  handlePlayPause: () => void;
  handleSetNewAudio: () => void;
  isPlaying: boolean;
  setArtist: Dispatch<SetStateAction<string>>;
  setIsMarkerClicked: Dispatch<SetStateAction<boolean>>;
}

export interface ShowMarkersProps {
  shows: ShowDataState;
  audioLink: string;
  newAudio: boolean;
  handleSetNewAudio: () => void;
  handlePlayPause: () => void;
  isPlaying: boolean;
  setArtist: Dispatch<SetStateAction<string>>;
  setIsMarkerClicked: (state: boolean) => void;
}

export interface PopUpProps extends MarkerPlayerProps {
  index: number;
  show: ShowData;
}

export interface ControlsTopProps {
  setUserData: Dispatch<SetStateAction<UserDataState>>;
  handleNewCityShows: () => void;
  handleDateRangeShows: () => void;
  handleCurrLocation: () => void;
}

export interface ControlsBottomProps {
  setUserData: Dispatch<SetStateAction<UserDataState>>;
  handleDateRangeShows: () => void;
  audioRef: MutableRefObject<HTMLAudioElement | null>;
  audioLink: string;
  newAudio: boolean;
  handlePlayPause: () => void;
  setIsPlaying: Dispatch<SetStateAction<boolean>>;
  isPlaying: boolean;
  isMarkerClicked: boolean;
  isAutoPlay: boolean;
  handleAutoPlay: () => void;
}

export interface MarkerPlayerProps {
  audioLink: string;
  newAudio: boolean;
  handlePlayPause: () => void;
  isPlaying: boolean;
}

export interface BottomPlayerProps extends Partial<ControlsBottomProps> {
  onPlay: () => void;
  onPause: () => void;
  onEnded: () => void;
}

export interface DateRangeProps {
  setUserData: Dispatch<SetStateAction<UserDataState>>;
}

export interface DateButtonInputProps {
  value?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}
