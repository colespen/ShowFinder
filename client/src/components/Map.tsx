import React, { useState, useEffect, useRef } from "react";

import "./styles.scss";

// import useGeoLocation, { NAVIGTOR_ERROR } from '../hooks/useGeoLocation';

// import Container from './MapContainer';
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
  // const geolocation = useGeoLocation();

  return <div></div>;
}
