import { PlayPauseArgs, SetNewAudioArgs } from "../datatypes/events";
import { ShowData } from "../datatypes/showData";

const cityFilter = (str: string) => {
  if (str) {
    const regex = new RegExp(/,/gm);
    const upperStr = str
      .toLowerCase()
      .split(" ")
      .filter((el) => el !== "")
      .map((el) => {
        el.trim();
        return el[0].toUpperCase() + el.substring(1);
      })
      .join(" ");
    if (!regex.test(str)) return upperStr;

    const index = str.indexOf(",");
    return upperStr.substring(0, index);
  } else {
    return "";
  }
};

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

const convertTo12hr = (startDate: string) => {
  if (!startDate || startDate.length < 13 || !startDate.includes("T")) {
    return "";
  }
  const hours24 = parseInt(startDate.slice(11, 13), 10);
  if (Number.isNaN(hours24)) return "";
  const hours12 = (hours24 % 12 || 12).toString();
  const amPm = hours24 < 12 ? "AM" : "PM";
  return `${hours12} ${amPm}`;
};

const getHeadliner = (show: ShowData) => {
  return show.performers?.[0]?.name || show.name || "";
};

const hasVenueCoords = (show: ShowData) => {
  return (
    show.venue?.latitude !== null &&
    show.venue?.latitude !== undefined &&
    show.venue?.longitude !== null &&
    show.venue?.longitude !== undefined &&
    Number.isFinite(Number(show.venue.latitude)) &&
    Number.isFinite(Number(show.venue.longitude))
  );
};

const hasValidCoords = (lat?: number, lng?: number) => {
  const latitude = Number(lat);
  const longitude = Number(lng);
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    !(latitude === 0 && longitude === 0) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
};

const artistNameFilter = (show: ShowData) => {
  const headliner = getHeadliner(show);
  return headliner.length > 30 ? headliner.substring(0, 30) + " ..." : headliner;
};

const setArtistNameFilter = (show: ShowData) => {
  let artist = getHeadliner(show);
  if (artist.includes("(")) {
    artist = artist.substring(0, artist.indexOf("("));
  }
  return artist.trim();
};

export {
  cityFilter,
  playPause,
  setNewAudioDelay,
  convertTo12hr,
  artistNameFilter,
  setArtistNameFilter,
  getHeadliner,
  hasVenueCoords,
  hasValidCoords,
};
