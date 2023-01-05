import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

import './styles.scss';

import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet';
import L from "leaflet";
import useGeoLocation from '../hooks/useGeoLocation';

import Title from './Title';
import DateRange from './DateRange';


export default function Map() {
  const [shows, setShows] = useState(
    JSON.parse(sessionStorage.getItem('shows')) || {}
  );
  const [artist, setArtist] = useState(
    JSON.parse(sessionStorage.getItem('artist')) || ""
  );
  const [currCity, setCurrCity] = useState(
    JSON.parse(sessionStorage.getItem('currCity')) || null
  );
  const [userData, setUserData] = useState(
    JSON.parse(sessionStorage.getItem('userData')) ||
    {
      dateRange: {},
      lat: null,
      lng: null,
      currAddress: {},
      newCity: "",
    });
  const [transition, setTransition] = useState({
    opacity: 1,
    type: "initial",
  });

  const isFirstRender = useRef(true);

  //////    Assign User's Current Coords
  const geolocation = useGeoLocation();
  const lat = geolocation.coords.lat;
  const lng = geolocation.coords.lng;

  ////// Toronto
  // const lat = 43.66362651471936;
  // const lng = -79.3924776050637;
  //// Montreal
  // const lat = 45.52557764805207;
  // const lng = -73.59029896192136;


  //////    Set Geo Coords State - First Render
  useEffect(() => {
    if (geolocation.loaded && isFirstRender.current
      && userData.lat === null) {
      setUserData(prev => ({
        ...prev, lat, lng,
      }));
      isFirstRender.current = false;
      return;
    }
  }, [isFirstRender, geolocation.coords.lat, geolocation.coords.lng, geolocation.loaded, userData.lat, lat, lng]);


  //////    Assign Current Date and maxDate Default
  const currDate = new Date();
  const minDate = `${currDate.getFullYear()}-${currDate.getMonth() + 1}-${currDate.getDate()}`;
  const maxDate = `${currDate.getFullYear()}-${currDate.getMonth() + 1}-${currDate.getDate() + 7}`;
  // ***temp hardcode +1 week maxDate


  //////    Set Default Date Range State
  useEffect(() => {
    setUserData(prev => (
      {
        ...prev,
        dateRange: { minDate, maxDate },
      }
    ));
  }, [minDate, maxDate]);


  ////////////////////////////////////////////////////////////////////
  //////    Calls to Server for Geo and Shows API 
  //////////////////////////////////////////////////////////////////

  /////   GET Current Location Shows and Geo - First Render
  const getShowsCurrCity = useCallback(() => {

    axios.get('/api/shows', {
      params: userData
    })
      .then((res) => {
        setShows(res.data);
        setCurrCity(res.data.currAddress.address.city);
        setUserData(prev => ({ ...prev, currAddress: res.data.currAddress }));
        console.log("~~~~~~~~~~~~~~POST", res.data);
      })
      .catch(err => console.log(err.message));
  }, [userData]);

  useEffect(() => {
    if (geolocation.loaded && (Object.keys(shows).length === 0)) {
      getShowsCurrCity();
    }
  }, [geolocation.loaded, shows, getShowsCurrCity]);


  //////    GET Current Location Shows and Geo - onClick
  const handleCurrLocationClick = () => {
    setCurrCity("");
    setTransition({ opacity: 1, type: "location" });
    setUserData(prev => ({
      ...prev, lat, lng,
    }));

    if (geolocation.loaded) {
      axios.get('/api/shows', {
        params: { ...userData, lat, lng }
      })
        .then((res) => {
          setShows(res.data);
          setCurrCity(res.data.currAddress.address.city);
          setUserData(prev => ({ ...prev, currAddress: res.data.currAddress }));
          console.log("~~~~~~~~~~~~~~POST", res.data);
        })
        .catch(err => console.log(err.message));
    }
  };

  //////    GET Date Range Shows and Geo - onClick
  const handleDateRangeClick = () => {
    if ((Object.keys(userData.dateRange).length === 2)) {
      setCurrCity("");
      setTransition({ opacity: 1, type: "dates" });
      getShowsCurrCity();
    }
  };


  //////    Set City Name Input
  const handleCityChange = e => {
    setUserData((prev) => ({ ...prev, newCity: e.target.value }));
  };
  //////    PUT New City to Server for Geo & New Shows API calls
  const handlePutRequest = () => {

    if (userData.newCity) {
      setCurrCity("");
      setTransition({ opacity: 1, type: "shows" });

      axios.put('/', userData)
        .then((res) => {
          setShows(res.data);
          setCurrCity(userData.newCity);
          setUserData((prev) => ({
            ...prev,
            lat: res.data.latLng[0].lat,
            lng: res.data.latLng[0].lon,
          }));
          console.log("~~~~~~~~~~~~~~~PUT", res.data);
        })
        .catch(err => console.log(err.message));
    };
  };

  //////    Submit City on Enter NOT WORKING!
  // const handleEnter = e => {
  //   if (e.key === "Enter") handlePutRequest();
  // };

  //////////////////////////////////////////////////////////////////
  //////
  ////////////////////////////////////////////////////////////////////


  //////    Save state to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('shows', JSON.stringify(shows));
    sessionStorage.setItem('currCity', JSON.stringify(currCity));
    sessionStorage.setItem('artist', JSON.stringify(artist));
    sessionStorage.setItem('userData', JSON.stringify(userData));
  }, [shows, artist, currCity, userData]);


  //////    Default position
  const budapest = [47.51983881388099, 19.032783326057594];


  //////    Use Current Location for map Position and circle
  function CurrentLocation() {
    const map = useMap();

    useEffect(() => {
      if (geolocation.loaded && currCity) map.flyTo({ lat: userData.lat, lng: userData.lng }, 12);
      ////    use setView instead of flyTo on page refresh
      // map.setView({ lat: userData.lat, lng: userData.lng }, 12);
      map.on('zoomend', () => {
        //// load position marker after animation
        const circle = L.circle(geolocation.coords, geolocation.accuracy);
        const fixCircle = L.circle(geolocation.coords, { radius: 150, color: 'blue', weight: 1, opacity: 0.55, fillColor: '#0000ff38', fillOpacity: 0.15 });

        if (geolocation.accuracy > 25) {
          fixCircle.addTo(map);
        } else {
          circle.addTo(map);
        }
      });
    }, [map]);

    return null;
  }


  //////    Artist Link promise chain
  const getArtist = (e) => {
    return new Promise(resolve => {
      setTimeout(resolve, 0);
    }).then(() => {
      return handleArtistName(e);
    }).then((artist) => {
      handleArtistLink(artist);
    })
      .catch(err => console.error(err.message));
  };
  //////    Set artist name onClick
  const handleArtistName = e => {
    setArtist((e.target.innerText).split(' ').join('+'));
    return (e.target.innerText).split(' ').join('+');
  };
  //////    Open artist name onClick
  const handleArtistLink = (artist) => {
    console.log("artist in handleArtistClick", artist);
    window.open(`https://www.songkick.com/search?utf8=%E2%9C%93&type=initial&query=${artist}&commit=`, '_blank', 'noreferrer');
  };

  //////    Set Date Range to State
  const handleDateSelect = (dateRange) => {
    setUserData(prev => (
      {
        ...prev,
        dateRange,
      }
    ));
  };

  //////    Auto Focus Text in Input
  const handleInputTextSelect = e => e.target.select();


  const newShowMarkers = (shows.data || []).map((show, index) =>
  (
    show.location.geo ?

      <Marker
        key={show.description}
        position={[show.location.geo.latitude, show.location.geo.longitude]}
      >
        <Popup key={index} id="show-popup">

          <ul className="artist-list" href="">
            {show.performer.map((artist, i) =>
            (
              <li className="artist" key={artist + i}>
                <button onClick={getArtist}>
                  {artist.name}
                </button>
              </li>
            ))}
          </ul>

          <a id="venue-name"
            href={show.location.sameAs}
            target="_blank"
            rel="noreferrer">
            {show.location.name}</a>
        </Popup>
      </Marker>
      :
      null
  )
  );

  return (
    <div className="map-main">
      <Title className="title"
        currCity={currCity} isFirstRender={isFirstRender.current} transition={transition}
      />
      <div className="controls-top">

        <div className="city-input">
          <input type="text"
            name="enter city"
            placeholder="enter a city"
            autoComplete="off"
            onChange={handleCityChange}
            onFocus={handleInputTextSelect}
          />
          <button onClick={handlePutRequest}
          // onKeyDownDown={handleEnter}
          >GO</button>
        </div>

        <div className="date-location" id="date-top">
          <DateRange handleDateSelect={handleDateSelect}
          />
          <button onClick={handleDateRangeClick}>GO</button>
        </div>
        <button id="current-location"
          onClick={handleCurrLocationClick}
        >
          <img id="location-icon"
            src="./target.png"
            alt="current-location-icon" />
        </button>

      </div>

      <MapContainer className="map-container"
        center={budapest}
        zoom={2.5} scrollWheelZoom={true}
      >
        {geolocation.loaded && newShowMarkers}

        <TileLayer
          attribution=
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <CurrentLocation />
      </MapContainer>

      <div className="controls-bottom">
        <div className="github">
          <a href="https://github.com/colespen/ShowFinder" 
          target="_blank"
          rel="noreferrer"
          > <img src="./github-mark.svg" width="18" height="18" alt="GitHub-link"></img></a>
          <span>Spencer Cole</span>
        </div>
        <div className="date-location" id="date-bottom">
          <DateRange handleDateSelect={handleDateSelect}
          />
          <button id="go-button"
            onClick={handleDateRangeClick}>GO</button>
        </div>
      </div>
    </div>
  );
}