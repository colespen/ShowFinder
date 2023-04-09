import { Dispatch, MutableRefObject, SetStateAction } from "react";

export type KeyboardEvent = React.KeyboardEvent<HTMLInputElement>;

export type ChangeEvent = React.ChangeEvent<HTMLInputElement>;

export type FocusEvent = React.FocusEvent<HTMLInputElement>;

export interface PlayPauseArgs {
  audioLink: string;
  isPlaying: boolean;
  audioRef: MutableRefObject<HTMLAudioElement | null>;
}

export interface SetNewAudioArgs {
  setNewAudio: Dispatch<SetStateAction<boolean>>;
  audioLink: string;
}
