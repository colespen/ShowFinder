import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet';
import L from "leaflet";
import useGeoLocation from '../hooks/useGeoLocation';

import './styles.scss';
// import testShows from '../data/test-show-rapid.json';

export default function Map() {
  const [shows, setShows] = useState(
    JSON.parse(localStorage.getItem('shows')) || {}
  );
  const [artist, setArtist] = useState(
    JSON.parse(localStorage.getItem('artist')) || ""
  );
  const [currCity, setCurrCity] = useState(
    JSON.parse(localStorage.getItem('currCity')) || null
  );

  const [newCity, setNewCity] = useState("");

  const geolocation = useGeoLocation();
  const isFirstRender = useRef(true);

  ////    Set Current Date and maxDate
  const currDate = new Date();
  const minDate = `${currDate.getFullYear()}-${currDate.getMonth() + 1}-${currDate.getDate()}`;
  const maxDate = `${currDate.getFullYear()}-${currDate.getMonth() + 1}-${currDate.getDate() + 2}`;

  // const lat = 52.520008;
  // const lng = 13.404954;
  const lat = geolocation.coords.lat;
  const lng = geolocation.coords.lng;

  const userData = {
    dateRange: { minDate, maxDate },
    lat,
    lng,
    newCity,
  };
  console.log("shows~~~~~~~~~~~~~: ", shows);

  ////    POST to server for city and shows API calls
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

//   const handleCityChange = e => {
//     setNewCity(e.target.value);
//   };
// ////    PUT to server for geo and new shows API calls
//   const handlePutRequest = () => {
//       axios.put('http://localhost:8001', userData)
//         .then((res) => {
//           setShows(res.data);
//           setCurrCity(newCity);
//           userData.lat = res.data.latLng.lat;
//           userData.lng = res.data.latLng.lon;
//           console.log("~~~~~~~~~~~~~~PUT", res.data);
//         })
//         .catch(err => console.log(err.message));
//   };

  ////    Save state to localStorage
  useEffect(() => {
    localStorage.setItem('shows', JSON.stringify(shows));
    localStorage.setItem('currCity', JSON.stringify(currCity));
    localStorage.setItem('artist', JSON.stringify(artist));
  }, [shows, artist, currCity]);

  ////    Default position
  const budapest = [47.51983881388099, 19.032783326057594]

  ////    Use Current Location for map Position and circle
  function CurrentLocation() {
    const map = useMap();
    useEffect(() => {
      if (geolocation.loaded) map.flyTo(geolocation.coords, 12);
      ////    use setView instead of flyTo on page refresh
      // map.setView(geolocation.coords, map.getZoom());
      map.on('zoomend', () => {
        // load position marker after animation
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


  ////    Set artist name onClick
  const handleArtistName = e => {
    // e.preventDefault();
    setArtist((e.target.innerText).split(' ').join('+'));
  };
  ////    Link to artist info
  ////    Wait until artist state changes to trigger
  ////    Don't run on first render
  useEffect(() => {
    const handleArtistClick = () => {
      console.log("artist in handleButton", artist);
      window.open(`https://www.songkick.com/search?utf8=%E2%9C%93&type=initial&query=${artist}&commit=`, '_blank', 'noreferrer');
    };
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    // handleArtistClick();

  }, [artist]);



  const newShowMarkers = (shows.data || []).map((show, index) => (
    <Marker
      key={show.description}
      position={[show.location.geo.latitude, show.location.geo.longitude]}>
      <Popup key={index}>

        <ul className="artist-list" href="">
          {show.performer.map((artist, i) =>
          (
            <li className="artist" key={artist + i}>
              <button onClick={handleArtistName}>
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
  ));

  return (
    <div className="map-main">
      <h1> {currCity ? "Shows in " +
        currCity : "grabbing your location..."}
      </h1>
      {/* <input type="text"
        name="enter city"
        placeholder="enter city name"
        onChange={handleCityChange} />
      <button onClick={handlePutRequest}>GO</button> */}

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