import { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet';
import L from "leaflet";
import useGeoLocation from '../hooks/useGeoLocation';

import './map.scss';
import testShows from '../data/test-show-rapid.json';

export default function Map(props) {
  // const [shows, setShows] = useState({});
  // const [newShows, setNewShows] = useState({});
  const [currCity, setCurrCity] = useState(null);
  const geolocation = useGeoLocation();
  console.log("geolocation ~~~~~~~~~~~~; ", geolocation);

  const hqToken = 'MIUlzyESU3Uvf_ZUQxzFzM0C3vae40bPOYJSMPsN';
  const rapidKey = 'daf9809102msh05c5b9a3abacab6p1573f0jsnbdb721a8ca04';
  const iqToken = 'pk.32218541d692e0df20b0912ebadf68bf';

  const currDate = new Date();
  const date = `${currDate.getFullYear()}-${currDate.getMonth() + 1}-${currDate.getDate()}`;
  const lat = geolocation.coords.lat;
  const lng = geolocation.coords.lng;

  const userData = {
    date,
    lat,
    lng,
  };

  useEffect(() => {
    if (geolocation.loaded) axios.post('http://localhost:8001', userData)
      .then(() => console.log("userData sent from client"))
      .catch(err => console.log(err.message));
  });


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

  // fetch city name using coords
  // useEffect(() => {
  //   const xhr = new XMLHttpRequest();
  //   if (geolocation.loaded) {
  //     xhr.open('GET',
  //       `https://us1.locationiq.com/v1/reverse.php?key=${iqToken}&lat=`
  //       + lat + "&lon=" + lng + "&format=json", true);
  //     xhr.send();
  //     xhr.onreadystatechange = processRequest;
  //     xhr.addEventListener("readystatechange", processRequest, false);
  //   }
  //   function processRequest(e) {
  //     if (xhr.readyState === 4 && xhr.status === 200) {
  //       const response = JSON.parse(xhr.responseText);
  //       const city = response.address.city;
  //       setCurrCity(city);
  //     }
  //   }
  // }, [lat, lng, geolocation.loaded]);

  // fetch HQ show data with params
  // useEffect(() => {
  //   const options = {
  //     method: 'GET',
  //     baseURL: 'https://api.predicthq.com/v1/events/',
  //     params: {
  //       'relevance': 'start_around,location_around',
  //       'start_around.origin': date,
  //       'location_around.origin': lat + "," + lng,
  //       'location_around.offset': '1km',
  //       // 'location_around.scale': '5km',
  //       'active.gte': date,
  //       'category': 'concerts'
  //     },
  //     headers: {
  //       authorization: `Bearer ${hqToken}`
  //     }
  //   };
  //   if (geolocation.loaded) axios.request(options)
  //     .then(res => {
  //       setShows(res.data);
  //       console.log("res.data~~~~~~~~~: ", res.data);
  //     })
  //     .catch(err => {
  //       console.error(err.message);
  //     });
  // }, [geolocation, date, lat, lng]);

  // results OR empty array seems wrong but need to not map on undefined axios get
  // const showMarkers = (shows.results || []).map(show => (
  //   show.entities.map(venue => (

  //     <Marker
  //       key={show.id}
  //       position={[show.location[1], show.location[0]]}>
  //       <Popup key={venue.entity_id}>
  //         {show.title} <br /> {venue.name}
  //       </Popup>
  //     </Marker>
  //   ))
  // ));

  // fetch Rapid show
  // useEffect(() => {
  //   const options = {
  //     method: 'GET',
  //     baseURL: 'https://concerts-artists-events-tracker.p.rapidapi.com/location',
  //     params: {
  //       'name': currCity,
  //       'minDate': date,
  //       'maxDate': date
  //     },
  //     headers: {
  //       'X-RapidAPI-Key': rapidKey,
  //       'X-RapidAPI-Host': 'concerts-artists-events-tracker.p.rapidapi.com'
  //     }
  //   };
  //   if (geolocation.loaded) axios.request(options)
  //     .then(res => {
  //       setNewShows(res.data);
  //       console.log("res.data~~~~~~~~~: ", res.data);
  //     })
  //     .catch(err => {
  //       console.error(err.message);
  //     });
  // }, [geolocation, date, currCity]);


  const newShowMarkers = (testShows.data || []).map((show, index) => (
    <Marker
      key={show.description}
      position={[show.location.geo.latitude, show.location.geo.longitude]}>
      <Popup key={index}>

        {show.performer.map((artist, i) =>
        (
          <ul className="artist-list">
            <li key={artist + i}>{artist.name}</li>
          </ul>
        ))}

        <a href={show.location.sameAs}
          target="_blank">
          {show.location.name}</a>
      </Popup>
    </Marker>
  ));


  console.log("testShows~~~~~~~~~: ", testShows);

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