import { useState, useEffect, useRef } from "react";
import "./styles.scss";

import useGeoLocation, { NAVIGTOR_ERROR } from "../hooks/useGeoLocation";
import MapContainerComponent from "./MapContainer/MapContainer";
import Title from "./Title";
import ControlsTop from "./ControlsTop";
import ControlsBottom from "./ControlsBottom";

import {
  getShows,
  getSpotifyToken,
  getSpotifySample,
  getNewCityShows,
  getCurrLocationShows,
  getNewDateRangeShows,
} from "../services/getApiData";
import { playPause, setNewAudioDelay } from "../helpers/utils";

import { UserDataState, DateRangeType } from "../datatypes/userData";
import { ShowDataState } from "../datatypes/showData";
import { userDataInitial } from "../datatypes/initialState";
import { KeyboardEvent, ChangeEvent, FocusEvent } from "../datatypes/events";

export default function Map() {
  const [shows, setShows] = useState<ShowDataState>({
    currentAddress: {},
    data: [],
    page: 0,
  });
  const [currCity, setCurrCity] = useState<string>("");
  const [cityQuery, setCityQuery] = useState<string>("");
  const [artist, setArtist] = useState<string>("");
  const [audioLink, setAudioLink] = useState<string>("");
  const [newAudio, setNewAudio] = useState<boolean>(false); //true
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isAutoPlay, setIsAutoplay] = useState(true);
  const [isMarkerClicked, setIsMarkerClicked] = useState<boolean>(false);
  // this isGeoError to render text in title upon geo error
  // const [isGeoError, setIsGeoError] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserDataState>(userDataInitial);
  const [transition, setTransition] = useState<{
    opacity: number;
    type: string;
  }>({
    opacity: 1,
    type: "initial",
  });
  const isFirstRender = useRef(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  //////    Assign User's Current Coords
  const geolocation = useGeoLocation();

  //////   Set Geo Coords State After Allow Access - First Render
  useEffect(() => {
    if (geolocation.error?.code === NAVIGTOR_ERROR.PERMISSION_DENIED) {
      // setIsGeoError(true);
    }
    if (geolocation.loaded && isFirstRender.current && userData.lat === 0) {
      setUserData((prev) => ({
        ...prev,
        ...geolocation.coords,
      }));
      isFirstRender.current = false;
      return;
    }
  }, [
    isFirstRender,
    geolocation.coords,
    geolocation.loaded,
    userData.lat,
    geolocation.error,
  ]);

  // set true to render <audio> when new artist audio link
  // TODO: this should only run with audioLink changes - broken
  useEffect(() => {
    if (!isFirstRender.current) {
      setNewAudio(true);
    }
    localStorage.setItem("audioLink", JSON.stringify(audioLink));
  }, [audioLink]);

  // Load Media for Playback with Ref when new audioLink
  useEffect(() => {
    if (audioRef.current && audioLink && isAutoPlay) {
      audioRef.current.load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioLink]);

  ////////////////////////////////////////////////////////////////////
  //////    Calls to Server for Geo and Shows API
  //////////////////////////////////////////////////////////////////
  const args = {
    geolocation,
    userData,
    currCity,
    cityQuery,
  };
  const callbacks = {
    setUserData,
    setShows,
    setCurrCity,
    setCityQuery,
    setTransition,
  };

  // //////    GET Current Location Shows/Geo/spotifyToken - First Render
  useEffect(() => {
    //                      changed from (shows) to (shows.data)
    if (geolocation.loaded && Object.keys(shows.data).length === 0) {
      //////    GET - /api/shows - rev geocode current coords then get shows
      getShows({
        userData,
        geolocation,
        callbacks: { setShows, setCurrCity, setUserData },
      });
      //////    POST - api/spotifyauth - retrieve spotifyToken in API
      getSpotifyToken();
    }
    // removed userData and shows from []
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geolocation]);

  //////    GET - current location shows and geo
  const handleCurrLocation = () =>
    getCurrLocationShows({ ...args, callbacks: { ...callbacks } });

  //////    GET - /api/newshows - fwd geo then new shows
  const handleNewCityShows = () =>
    getNewCityShows({ ...args, callbacks: { ...callbacks } });

  //////    GET - /api/shows - date range rev geo shows
  const handleDateRangeShows = () =>
    getNewDateRangeShows({
      ...args,
      callbacks: { ...callbacks, handleNewCityShows },
    });

  //////    GET - api/spotifysample - artist ID then get preview data
  useEffect(() => {
    if (artist) {
      getSpotifySample(artist, setAudioLink, setIsPlaying);
    }
  }, [artist]);

  //////////////////////////////////////////////////////////////////
  //////
  ////////////////////////////////////////////////////////////////////

  ////    Set City Name Input
  const handleCityChange = (e: ChangeEvent) => {
    setUserData((prev) => ({ ...prev, newCity: e.target.value }));
  };
  ////    Submit City on Enter
  const handleNewCityOnEnter = (e: KeyboardEvent) => {
    if (e.key === "Enter") handleNewCityShows();
  };
  ////    Set Date Range to State
  const handleDateSelect = (dateRange: DateRangeType) => {
    setUserData((prev) => ({ ...prev, dateRange }));
  };
  ////   Auto Focus Text in Input
  const handleInputTextSelect = (e: FocusEvent) => e.target.select();
  // (e.target as HTMLInputElement).select();

  ////    Set Artist from marker for audio src (headliner [0])
  const handleSetArtist = (artist: string) => {
    // was if (shows) ***
    if (shows.data) setArtist(artist);
  };

  const handlePlayPause = () => {
    playPause({ audioLink, isPlaying, audioRef });
  };
  const handleSetNewAudio = () => {
    setNewAudioDelay({ setNewAudio, audioLink });
  };

  const handleAutoPlay = () => {
    setIsAutoplay((prev) => !prev);
  };

  return (
    <div className="map-main">
      <Title
        currCity={currCity}
        isFirstRender={isFirstRender.current}
        transition={transition}
        geolocation={geolocation}
        // isGeoError={isGeoError}
      />
      <ControlsTop
        setUserData={setUserData}
        handleCityChange={handleCityChange}
        handleInputTextSelect={handleInputTextSelect}
        handleNewCityOnEnter={handleNewCityOnEnter}
        handleNewCityShows={handleNewCityShows}
        handleDateSelect={handleDateSelect}
        handleDateRangeShows={handleDateRangeShows}
        handleCurrLocation={handleCurrLocation}
      />
      <MapContainerComponent
        geolocation={geolocation}
        shows={shows}
        userData={userData}
        currCity={currCity}
        handleSetArtist={handleSetArtist}
        audioLink={audioLink}
        newAudio={newAudio}
        handlePlayPause={handlePlayPause}
        handleSetNewAudio={handleSetNewAudio}
        isPlaying={isPlaying}
        setIsMarkerClicked={setIsMarkerClicked}
      />
      <ControlsBottom
        setUserData={setUserData}
        handleDateSelect={handleDateSelect}
        handleDateRangeShows={handleDateRangeShows}
        audioRef={audioRef}
        audioLink={audioLink}
        newAudio={newAudio}
        handlePlayPause={handlePlayPause}
        setIsPlaying={setIsPlaying}
        isPlaying={isPlaying}
        isMarkerClicked={isMarkerClicked}
        isAutoPlay={isAutoPlay}
        handleAutoPlay={handleAutoPlay}
      />
    </div>
  );
}
