import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

import './styles.scss';

import useGeoLocation, { NAVIGTOR_ERROR } from '../hooks/useGeoLocation';

import Container from './MapContainer';
import Title from './Title';
import ControlsTop from './ControlsTop';
import ControlsBottom from './ControlsBottom';

import { minDate, maxDate } from './DateRange';
import { cityFilter } from '../helpers/utils';

////// use Render.com server ******
axios.defaults.baseURL = 'https://showfinder-server.onrender.com/';

export default function Map() {
  const [shows, setShows] = useState({});
  const [currCity, setCurrCity] = useState(null);
  const [artist, setArtist] = useState(null);
  const [audioLink, setAudioLink] = useState(null);
  const [newAudio, setNewAudio] = useState(true);
  const [audioSource, setAudioSource] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMarkerClicked, setIsMarkerClicked] = useState(false)
  const [userData, setUserData] = useState(
    {
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

  //////    Set Default Date Range State
  useEffect(() => {
    setUserData(prev => (
      {
        ...prev,
        dateRange: { minDate, maxDate },
      }
    ));
  }, []);

  const setShowCityUserData = (data) => {
    setShows(data);
    setCurrCity(data.currentAddress.address.city);
    setUserData(prev => (
      { ...prev, currentAddress: data.currentAddress })
    );
  };

  // Only display spinner if new marker (artist)
  const handleSetNewAudio = () => {
    setNewAudio(false);
    setTimeout(() => {
      if (!audioLink) {
        setNewAudio(true);
      }
    }, 500);
  };
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

  const handlePlayPause = () => {
    if (audioLink) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };


  ////////////////////////////////////////////////////////////////////
  //////    Calls to Server for Geo and Shows API 
  //////////////////////////////////////////////////////////////////

  /////   GET Current Location Shows/Geo/spotifyToken - First Render
  useEffect(() => {
    if (geolocation.loaded && (Object.keys(shows).length === 0)) {

      axios.get('/api/shows', {
        params: {
          ...userData,
          ...geolocation.coords
        }
      })
        .then((res) => {
          setShowCityUserData(res.data);
        })
        .catch(err => console.log(err.message));

      // retrieve spotifyToken in API
      axios.post('/api/spotifyauth')
        .then((response) => {
          // console.log("/api/spotifyauth: ", response.data);
        })
        .catch(err => console.log(err.message));
    }
  }, [geolocation.loaded, geolocation.coords, shows, userData]);

  //////    GET Current Location Shows and Geo - onClick
  const handleCurrLocationClick = () => {
    setCurrCity("");
    setTransition({ opacity: 1, type: "location" });
    setUserData(prev => ({
      ...prev,
      ...geolocation.coords
    }));
    if (geolocation.loaded) {

      axios.get('/api/shows', {
        params: {
          ...userData,
          ...geolocation.coords
        }
      })
        .then((res) => {
          setShowCityUserData(res.data);
        })
        .catch(err => console.log(err.message));
    }
  };

  //////    GET Date Range Shows and Geo - onClick
  const handleDateRangeClick = () => {
    if ((Object.keys(userData.dateRange).length === 2)) {
      setCurrCity("");
      setTransition({ opacity: 1, type: "dates" });
      // const newCity = cityFilter(userData.newCity);

      if (userData.newCity === "") {

        axios.get('/api/shows', {
          params: userData
        })
          .then((res) => {
            // console.log("res.data from /shows: ", res.data);
            setShowCityUserData(res.data);
          })
          .catch(err => console.log(err.message));
      } else {
        handleNewCityRequest();
      }
    }
  };

  //////    GET New City --> Geo & New Shows API calls
  const handleNewCityRequest = () => {
    if (userData.newCity) {
      setCurrCity("");
      setTransition({ opacity: 1, type: "shows" });

      axios.get('/api/newshows', { params: userData })
        .then((res) => {
          // console.log("res.data from /newshows: ", res.data);
          setShows(res.data);
          setCurrCity(cityFilter(userData.newCity));
          setUserData((prev) => ({
            ...prev,
            lat: res.data.latLng[0].lat,
            lng: res.data.latLng[0].lon,
          }));
        })
        .catch(err => console.log(err.message));
    };
  };

  //////    GET and Set Audio When New Artist
  useEffect(() => {
    if (artist) {
      axios.get('/api/spotifysample', { params: { artist } })
        .then((response) => {
          // console.log("response.data from /api/spotifysample: ", response.data);
          setAudioLink(response.data.topTrack);
          setIsPlaying(false);
        })
        .catch(err => console.log(err.message));
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
    if (e.key === "Enter") handleNewCityRequest();
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
        handleCityChange={handleCityChange}
        handleInputTextSelect={handleInputTextSelect}
        newCityOnEnter={newCityOnEnter}
        handleNewCityRequest={handleNewCityRequest}
        handleDateSelect={handleDateSelect}
        handleDateRangeClick={handleDateRangeClick}
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
        // audioRef={audioRef}
        handlePlayPause={handlePlayPause}
        handleSetNewAudio={handleSetNewAudio}
        isPlaying={isPlaying}
        setIsMarkerClicked={setIsMarkerClicked}
      />
      <ControlsBottom
        handleDateSelect={handleDateSelect}
        handleDateRangeClick={handleDateRangeClick}
        audioRef={audioRef}
        audioLink={audioLink}
        newAudio={newAudio}
        handlePlayPause={handlePlayPause}
        setIsPlaying={setIsPlaying}
        isPlaying={isPlaying}
        setAudioSource={setAudioSource}
        audioSource={audioSource}
        isMarkerClicked={isMarkerClicked}
      />
    </div>
  );
}