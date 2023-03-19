import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

import './styles.scss';

import useGeoLocation, { NAVIGTOR_ERROR } from '../hooks/useGeoLocation';

import Container from './MapContainer';
import Title from './Title';

import DateRange, { minDate, maxDate } from './DateRange';
import { cityFilter } from '../helpers/utils';

////// use Render.com server ******
// axios.defaults.baseURL = 'https://showfinder-server.onrender.com/';

export default function Map() {
  const [shows, setShows] = useState({});
  const [currCity, setCurrCity] = useState(null);
  const [artist, setArtist] = useState(null);
  const [audioLink, setAudioLink] = useState(null);
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
          console.log("/api/spotifyauth: ", response.data);
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
            console.log("res.data from /shows: ", res.data);
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
          console.log("res.data from /newshows: ", res.data);
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

  const handleSetArtist = (artist) => {
    if (shows) setArtist(artist);
  };

  useEffect(() => {
    if (artist) {
      axios.get('/api/spotifysample', { params: { artist } })
        .then((response) => {
          console.log("response.data in useEffect: ", response.data);
          setAudioLink(response.data.topTrack);
        })
        .catch(err => console.log(err.message));
    }
  }, [artist]);

  console.log("artist: ", artist);
  console.log("audioLink: ", audioLink);

  //////////////////////////////////////////////////////////////////
  //////
  ////////////////////////////////////////////////////////////////////


  //////    Set City Name Input
  const handleCityChange = e => {
    setUserData((prev) => ({ ...prev, newCity: e.target.value }));
  };
  ////    Submit City on Enter
  const newCityOnEnter = e => {
    if (e.key === "Enter") handleNewCityRequest();
  };
  //////    Set Date Range to State
  const handleDateSelect = (dateRange) => {
    setUserData(prev => (
      { ...prev, dateRange, }
    ));
  };
  //////    Auto Focus Text in Input
  const handleInputTextSelect = e => e.target.select();


  return (
    <div className="map-main">
      <Title
        currCity={currCity}
        isFirstRender={isFirstRender.current}
        transition={transition}
        geolocation={geolocation}
      />
      <div className="controls-top">
        <div className="city-input">
          <input type="text"
            name="enter city"
            placeholder="enter a city, state/country"
            autoComplete="off"
            spellCheck="false"
            onChange={handleCityChange}
            onFocus={handleInputTextSelect}
            onKeyDown={newCityOnEnter}
          />
          <button onClick={handleNewCityRequest}
          >GO</button>
        </div>

        <div className="date-location" id="date-top">
          <DateRange handleDateSelect={handleDateSelect}
          />
          <button id="go-button-top"
            onClick={handleDateRangeClick}>GO</button>
        </div>
        <button id="current-location"
          onClick={handleCurrLocationClick}
        >
          <img id="location-icon"
            src="./target.png"
            alt="current-location-icon" />
        </button>
      </div>

      <Container
        geolocation={geolocation}
        shows={shows}
        userData={userData}
        currCity={currCity}
        handleSetArtist={handleSetArtist}
        audioLink={audioLink}
      />

      <div className="controls-bottom">
        <div className="github">
          <a href="https://github.com/colespen/ShowFinder"
            target="_blank"
            rel="noreferrer"
          >
            <img src="./github-mark.svg" width="18" height="18"
              alt="GitHub-link"></img>
          </a>
          <span>Spencer Cole</span>
        </div>
        <div className="date-location" id="date-bottom">
          <DateRange handleDateSelect={handleDateSelect}
          />
          <button id="go-button-bottom"
            onClick={handleDateRangeClick}>GO</button>
        </div>
      </div>
    </div>
  );
}