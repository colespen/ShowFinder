import { useState, useEffect, useRef } from 'react';

import './styles.scss';

import useGeoLocation, { NAVIGTOR_ERROR } from '../hooks/useGeoLocation';

import Container from './MapContainer';
import Title from './Title';
import ControlsTop from './ControlsTop';
import ControlsBottom from './ControlsBottom';

import {
  getShows,
  getSpotifyToken,
  getSpotifySample,
  getNewCityShowsRequest,
  getCurrLocationShows,
  getNewDateRangeShows
} from '../services/getApiData';
import { handlePlayPause, handleSetNewAudio } from '../helpers/utils';


export default function Map() {
  const [shows, setShows] = useState({});
  const [currCity, setCurrCity] = useState(null);
  const [artist, setArtist] = useState(null);
  const [audioLink, setAudioLink] = useState(null);
  const [newAudio, setNewAudio] = useState(true);
  const [audioSource, setAudioSource] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMarkerClicked, setIsMarkerClicked] = useState(false);
  const [userData, setUserData] = useState({
    dateRange: {},
    lat: null,
    lng: null,
    currentAddress: {},
    newCity: "",
  });
  const [transition, setTransition] = useState({
    opacity: 1,
    type: "initial",
  });
  const isFirstRender = useRef(true);
  const audioRef = useRef(null);

  //////    Assign User's Current Coords
  const geolocation = useGeoLocation();

  //////   Set Geo Coords State After Allow Access - First Render
  useEffect(() => {
    if (geolocation.error === NAVIGTOR_ERROR.PERMISSION_DENIED) {
      return <div>Please allow geolocation first.</div>;
    };
    if (geolocation.loaded && isFirstRender.current
      && userData.lat === null) {
      setUserData(prev => ({
        ...prev,
        ...geolocation.coords
      }));
      isFirstRender.current = false;
      return;
    }
  }, [isFirstRender, geolocation.coords, geolocation.loaded,
    userData.lat, geolocation.error]);

  // render <audio> when new artist audio link
  useEffect(() => {
    setNewAudio(true);
  }, [audioLink]);

  // Load Media for Playback with Ref when new audioLink
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
    };
  }, [audioLink]);

  ////////////////////////////////////////////////////////////////////
  //////    Calls to Server for Geo and Shows API 
  //////////////////////////////////////////////////////////////////
  const args = {
    geolocation,
    userData,
    setUserData,
    setShows,
    currCity,
    setCurrCity,
    setTransition
  };

  //////    GET Current Location Shows/Geo/spotifyToken - First Render
  useEffect(() => {
    if (geolocation.loaded && (Object.keys(shows).length === 0)) {
      //////    GET - /api/shows - reverse geocode current coords then get shows
      getShows(userData, geolocation, setShows, setCurrCity, setUserData);
      //////    POST - api/spotifyauth - retrieve spotifyToken in API
      getSpotifyToken();
    }
  }, [geolocation, shows, userData]);

  //////    GET - current location shows and geo
  const handleCurrLocationClick = () => getCurrLocationShows({ ...args });

  //////    GET - /api/newshows - fwd geo then new shows
  const handleNewCityShowsRequest = () => getNewCityShowsRequest({ ...args });

  //////    GET - /api/shows - date range rev geo shows
  const handleDateRangeShowsClick = () => getNewDateRangeShows(
    { ...args, handleNewCityShowsRequest });

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
  const handleCityChange = e => {
    setUserData((prev) => ({ ...prev, newCity: e.target.value }));
  };
  ////    Submit City on Enter
  const newCityOnEnter = e => {
    if (e.key === "Enter") handleNewCityShowsRequest();
  };
  ////    Set Date Range to State
  const handleDateSelect = (dateRange) => {
    setUserData(prev => (
      { ...prev, dateRange, }
    ));
  };
  ////   Auto Focus Text in Input
  const handleInputTextSelect = e => e.target.select();

  ////    Set Artist from marker for src (headliner [0])
  const handleSetArtist = (artist) => {
    if (shows) setArtist(artist);
  };


  return (
    <div className="map-main">
      <Title
        currCity={currCity}
        isFirstRender={isFirstRender.current}
        transition={transition}
        geolocation={geolocation}
      />
      <ControlsTop
        setUserData={setUserData}
        handleCityChange={handleCityChange}
        handleInputTextSelect={handleInputTextSelect}
        newCityOnEnter={newCityOnEnter}
        handleNewCityRequest={handleNewCityShowsRequest}
        handleDateSelect={handleDateSelect}
        handleDateRangeClick={handleDateRangeShowsClick}
        handleCurrLocationClick={handleCurrLocationClick}
      />
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
      <ControlsBottom
        setUserData={setUserData}
        handleDateSelect={handleDateSelect}
        handleDateRangeClick={handleDateRangeShowsClick}
        audioRef={audioRef}
        audioLink={audioLink}
        newAudio={newAudio}
        handlePlayPause={() => handlePlayPause(audioLink, isPlaying, audioRef)}
        setIsPlaying={setIsPlaying}
        isPlaying={isPlaying}
        setAudioSource={setAudioSource}
        audioSource={audioSource}
        isMarkerClicked={isMarkerClicked}
      />
    </div>
  );
}