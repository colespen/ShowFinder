import { PlayPauseArgs, SetNewAudioArgs } from "../datatypes/events";
import { ShowData } from "../datatypes/showData";
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
/**
 * select either filtered artist from description or performer list and filter length...
 */
const artistNameFilter = (show: ShowData) => {
  let headliner = "";
  const indexOfAt = show.description.indexOf("at");
  const headlinerFromDescription = show.description.substring(0, indexOfAt);

  if (show.performer.length === 0) {
    headliner = headlinerFromDescription;
  } else {
    headliner = show.performer[0].name;
  }
  const artistName =
    headliner.length > 41 ? headliner.substring(0, 41) + " ..." : headliner;
  return artistName;
};

export {
  cityFilter,
  playPause,
  setNewAudioDelay,
  convertTo12hr,
  artistNameFilter,
};
