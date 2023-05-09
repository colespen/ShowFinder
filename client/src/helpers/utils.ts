import { PlayPauseArgs, SetNewAudioArgs } from "../datatypes/events";

/**
 * filter city name before comma for currCity
 */
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

/**
 * Only display spinner if new marker (artist) and hide initial "audio unavailable"
 */
const setNewAudioDelay = ({ setNewAudio, audioLink }: SetNewAudioArgs) => {
  setNewAudio(false);
  const setStateDelay = setTimeout(() => {
    if (!audioLink) {
      setNewAudio(true);
    }
  }, 500);
  return () => clearTimeout(setStateDelay);
};

const playPause = ({ audioLink, isPlaying, audioRef }: PlayPauseArgs) => {
  if (audioLink && audioRef.current) {
    if (audioRef.current.currentSrc !== audioLink) {
      audioRef.current.load();
    }
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  }
};

/**
 * convert 24hr to 12hr from ISO 8601 string
 */
const convertTo12hr = (startDate: string) => {
  const timeString = startDate;
  const hours24 = parseInt(timeString.slice(11, 13), 10);
  const hours12 = (hours24 % 12 || 12).toString();
  const minutes = timeString.slice(14, 16);
  const amPm = hours24 < 12 ? "AM" : "PM";
  const timeString12hr = `${hours12}:${minutes} ${amPm}`;
  return timeString12hr;
};

export { cityFilter, playPause, setNewAudioDelay, convertTo12hr };
