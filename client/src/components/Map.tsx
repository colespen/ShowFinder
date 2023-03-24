import React, { useState, useEffect, useRef } from "react";

import "./styles.scss";

import useGeoLocation, { NAVIGTOR_ERROR } from "../hooks/useGeoLocation";

import Container from './MapContainer';
// import Title from './Title';
// import ControlsTop from './ControlsTop';
// import ControlsBottom from './ControlsBottom';

// import {
//   getShows,
//   getSpotifyToken,
//   getSpotifySample,
//   getNewCityShowsRequest,
//   getCurrLocationShows,
//   getNewDateRangeShows
// } from '../services/getApiData';
// import { handlePlayPause, handleSetNewAudio } from '../helpers/utils';

import { UserDataState } from "../datatypes/userData";
import { ShowDataState } from "../datatypes/showData";
import { JSXElement } from "@babel/types";

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
  const [newAudio, setNewAudio] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMarkerClicked, setIsMarkerClicked] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserDataState>({
    dateRange: {
      maxDate: "",
      minDate: "",
    },
    lat: null,
    lng: null,
    currentAddress: {},
    newCity: "",
  });
  const [transition, setTransition] = useState<{
    opacity: number;
    type: string;
  }>({
    opacity: 1,
    type: "initial",
  });
  const isFirstRender = useRef(true);
  const audioRef = useRef(null);

  //////    Assign User's Current Coords
  const geolocation = useGeoLocation();

  //////   Set Geo Coords State After Allow Access - First Render
  useEffect(() => {
    if (geolocation.error?.code === NAVIGTOR_ERROR.PERMISSION_DENIED) {
      return <div>Please allow geolocation first.</div>;
    }
    if (geolocation.loaded && isFirstRender.current && userData.lat === null) {
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

  // render <audio> when new artist audio link
  useEffect(() => {
    setNewAudio(true);
  }, [audioLink]);

  // Load Media for Playback with Ref when new audioLink
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
    }
  }, [audioLink]);

  return (
    <div className="map-main">
      <Container
        geolocation={geolocation}
        shows={shows}
        userData={userData}
        currCity={currCity}
        handleSetArtist={handleSetArtist}
        audioLink={audioLink}
        newAudio={newAudio}
        handlePlayPause={() => handlePlayPause(audioLink, isPlaying, audioRef)}
        handleSetNewAudio={() => handleSetNewAudio(setNewAudio, audioLink)}
        isPlaying={isPlaying}
        setIsMarkerClicked={setIsMarkerClicked}
      />
    </div>
  );
}
