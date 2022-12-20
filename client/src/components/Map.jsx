import { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet';
import L from "leaflet";
import useGeoLocation from '../hooks/useGeoLocation';

import './styles.scss';
// import testShows from '../data/test-show-rapid.json';

export default function Map(props) {
  // const [shows, setShows] = useState({});
  const [newShows, setNewShows] = useState({});
  const [currCity, setCurrCity] = useState(null);
  const geolocation = useGeoLocation();
  console.log("geolocation ~~~~~~~~~~~~; ", geolocation);

  const currDate = new Date();
  const minDate = `${currDate.getFullYear()}-${currDate.getMonth() + 1}-${currDate.getDate()}`;
  const maxDate = `${currDate.getFullYear()}-${currDate.getMonth() + 1}-${currDate.getDate() + 4}`;


  const lat = geolocation.coords.lat;
  const lng = geolocation.coords.lng;

  const userData = {
    dateRange: { minDate, maxDate },
    lat,
    lng,
  };

  console.log(userData.dateRange);

  useEffect(() => {
    if (geolocation.loaded) {
      axios.post('http://localhost:8001', userData)
        .then((res) => {
          setNewShows(res.data);
          setCurrCity(res.data.currAddress.address.city);
          console.log("~~~~~~~~~~~~~~POST in client: ", res.data)

        })
        .catch(err => console.log(err.message));
    }
  }, [geolocation.loaded, userData, currCity]);

  console.log(newShows, ": ~~~~~~~~~~newShows");


  const egypt =
    [31.403292642948028, 30.853644619611597];

  function CurrentLocation() {
    const map = useMap();
    useEffect(() => {
      if (geolocation.loaded) map.flyTo(geolocation.coords, 12);
      //use setView instead of flyTo on page refresh
      // map.setView(geolocation.coords, map.getZoom());
      map.on('zoomend', () => {
        // load position marker after animation
        const radius = geolocation.accuracy;
        const circle = L.circle(geolocation.coords, radius);
        circle.addTo(map);
      });
    }, [map]);
    return null;
  }


  const newShowMarkers = (newShows.data || []).map((show, index) => (
    <Marker
      key={show.description}
      position={[show.location.geo.latitude, show.location.geo.longitude]}>
      <Popup key={index}>

        {show.performer.map((artist, i) =>
        (
          <ul className="artist-list">
            <a href="">
              <li className="artist" key={artist + i}>{artist.name}</li>
            </a>
          </ul>
        ))}

        <a href={show.location.sameAs}
          target="_blank"
          rel="noreferrer">
          {show.location.name}</a>
      </Popup>
    </Marker>
  ));

  // console.log("testShows~~~~~~~~~: ", testShows);

  return (
    <div className="map-main">
      <h1> {currCity ? "Shows in " +
        currCity : "grabbing your location..."}
      </h1>

      <MapContainer className="map-container"
        center={egypt}
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