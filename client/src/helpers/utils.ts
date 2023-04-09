import { PlayPauseArgs, SetNewAudioArgs } from "../datatypes/events";

// filter city name before comma for currCity
const cityFilter = (str: string) => {
  if (str) {
    const regex = new RegExp(/,/gm);
    const upperStr = str
      .toLowerCase()
      .split(" ")
      .map((el) => el[0].toUpperCase() + el.substring(1))
      .join(" ");
    if (!regex.test(str)) return upperStr;

    const index = str.indexOf(",");
    return upperStr.substring(0, index);
  } else {
    return "";
  }
};

// Only display spinner if new marker (artist) and to hide initial "audio unavailable"
const handleSetNewAudio = ({ setNewAudio, audioLink }: SetNewAudioArgs) => {
  setNewAudio(false);
  setTimeout(() => {
    if (!audioLink) {
      setNewAudio(true);
    }
  }, 500);
};

const handlePlayPause = ({ audioLink, isPlaying, audioRef }: PlayPauseArgs) => {
  if (audioLink) {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
  }
};

export { cityFilter, handlePlayPause, handleSetNewAudio };
