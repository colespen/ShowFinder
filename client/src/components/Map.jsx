import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet';
import L from "leaflet";
import useGeoLocation from '../hooks/useGeoLocation';

import './styles.scss';
// import testShows from '../data/test-show-rapid.json';

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
    {
      dateRange: {},
      lat: 0,
      lng: 0,
      newCity: "",
    });
  const isFirstRender = useRef(true);

  ////    Save user's current coords
  const geolocation = useGeoLocation();
  const lat = geolocation.coords.lat;
  const lng = geolocation.coords.lng;

  ////    Save Current Date and maxDate
  const currDate = new Date();
  const minDate = `${currDate.getFullYear()}-${currDate.getMonth() + 1}-${currDate.getDate() - 10}`;
  const maxDate = `${currDate.getFullYear()}-${currDate.getMonth() + 1}-${currDate.getDate()}`;

  ////    Set All User Data
  useEffect(() => {
    setUserData(
      {
        dateRange: { minDate, maxDate },
        lat, lng,
        newCity: "",
      });
  }, [minDate, maxDate, lat, lng]);

  // console.log("window location: ", window.location);



  ////    POST to server for geo and shows API calls
  useEffect(() => {
    if (geolocation.loaded && (Object.keys(shows).length === 0)) {
      axios.post('http://localhost:8001', userData)
        .then((res) => {
          setShows(res.data);
          setCurrCity(res.data.currAddress.address.city);
          console.log("~~~~~~~~~~~~~~POST", res.data);
        })
        .catch(err => console.log(err.message));
    }
  }, [geolocation.loaded, userData, currCity, shows]);



  ////    Set City Name Input
  const handleCityChange = e => {
    setUserData((prev) => ({ ...prev, newCity: e.target.value }));
  };
  ////    PUT to server for geo and new shows API calls
  const handlePutRequest = () => {
    axios.put('http://localhost:8001', userData)
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

  ////    Save state to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('shows', JSON.stringify(shows));
    sessionStorage.setItem('currCity', JSON.stringify(currCity));
    sessionStorage.setItem('artist', JSON.stringify(artist));
  }, [shows, artist, currCity]);


  ////    Default position
  const budapest = [47.51983881388099, 19.032783326057594];


  ////    Use Current Location for map Position and circle
  function CurrentLocation() {
    const map = useMap();
    useEffect(() => {
      if (geolocation.loaded && currCity) map.flyTo({ lat: userData.lat, lng: userData.lng }, 12);
      console.log("userData in CurrentLocation effect~~~~~~: ", userData)
      ////    use setView instead of flyTo on page refresh
      // map.setView(geolocation.coords, map.getZoom());
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



const getArtist = (e) => {
  return new Promise (resolve => {
    setTimeout(resolve, 0);
  }).then(() => {
    return handleArtistName(e);
  }).then((artist) => {
    handleArtistLink(artist)
  })
  .catch(err => console.error(err.message))
}

  ////    Set artist name onClick
  const handleArtistName = e => {
      // e.preventDefault();
      setArtist((e.target.innerText).split(' ').join('+'));
      console.log("artist in handleArtistName", artist);
      return (e.target.innerText).split(' ').join('+')
  };

  const handleArtistLink = (artist) => {
    console.log("artist in handleArtistClick", artist);
    window.open(`https://www.songkick.com/search?utf8=%E2%9C%93&type=initial&query=${artist}&commit=`, '_blank', 'noreferrer');
  };
  
  useEffect(() => {
    if (isFirstRender.current && !(Object.keys(shows).length === 0 && shows.constructor === Object)) {
      isFirstRender.current = false;
      return;
    }
    // if (!isFirstRender.current) {
    //   handleArtistClick();
    //   return;
    // }
  }, [artist, shows]);
  console.log("shows~~~~~~~~~: ", shows);
  console.log("artist~~~~~~~~: ", artist);
  console.log("isFirstRender", isFirstRender.current);


  const newShowMarkers = (shows.data || []).map((show, index) =>
  (
    show.location.geo ?

      <Marker
        key={show.description}
        position={[show.location.geo.latitude, show.location.geo.longitude]}
      >
        <Popup key={index}>

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
      <h1 className="title"> {currCity ? "Shows in " +
        currCity : "grabbing your location..."}
      </h1>
      <div className="city-input">
        <input type="text"
          name="enter city"
          placeholder="coming soon..."
          onChange={handleCityChange} />
        <button onClick={handlePutRequest}>GO</button>
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
    </div>
  );
}