import { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet';
import L from "leaflet";
import useGeoLocation from '../hooks/useGeoLocation';


export default function Map(props) {
  const [shows, setShows] = useState({});
  const [currCity, setCurrCity] = useState(null);
  const geolocation = useGeoLocation();
  console.log("geolocation ~~~~~~~~~~~~; ", geolocation);

  const auth = 'MIUlzyESU3Uvf_ZUQxzFzM0C3vae40bPOYJSMPsN';

  const current = new Date();
  const date = `${current.getFullYear()}-${current.getMonth() + 1}-${current.getDate()}`;

  const lat = geolocation.coords.lat;
  const lng = geolocation.coords.lng;

  // const hqURL = `https://api.predicthq.com/v1/events/?relevance=rank,start_around,location_around&start_around.origin=2022-12-12&location_around.origin=${geolocation.coords.lat},${geolocation.coords.lng}&location_around.offset=1km&location_around.scale=10km&within=50km@${geolocation.coords.lat},${geolocation.coords.lng}&active.gte=2022-12-12&category=concerts&Authorization=MIUlzyESU3Uvf_ZUQxzFzM0C3vae40bPOYJSMPsN`;

  // useEffect(() => {
  //   if (geolocation.loaded) axios.get(hqURL, {
  //     headers: {
  //       authorization: `Bearer ${auth}`
  //     }
  //   })
  //     .then(res => {
  //       setShows(res.data);
  //       console.log("res.data~~~~~~~~~: ", res.data);
  //     })
  //     .catch(err => {
  //       console.error(err.message);
  //     });
  // }, [geolocation, hqURL]);

  const egypt =
    [31.403292642948028, 30.853644619611597];


  function CurrentLocation() {
    const map = useMap();
    console.log("~~~~~~~~~~~~~~~map.flyTo(): ", map.flyTo)
    useEffect(() => {
      if (geolocation.loaded) map.flyTo(geolocation.coords, 12);
      //use setView() if page refresh
      // map.setView(geolocation.coords, map.getZoom());
      map.on('zoomend', () => {
        // load position marker after animation
        const radius = geolocation.accuracy;
        const circle = L.circle(geolocation.coords, radius);
        circle.addTo(map);
      })
    }, [map]);
    return null;
  }

  useEffect(() => {
    const xhr = new XMLHttpRequest();

    const token = 'pk.32218541d692e0df20b0912ebadf68bf';
    if (geolocation.loaded) {
      xhr.open('GET',
        `https://us1.locationiq.com/v1/reverse.php?key=${token}&lat=`
        + lat + "&lon=" + lng + "&format=json", true);
      xhr.send();
      xhr.onreadystatechange = processRequest;
      xhr.addEventListener("readystatechange", processRequest, false);
    }

    function processRequest(e) {
      if (xhr.readyState == 4 && xhr.status == 200) {
        const response = JSON.parse(xhr.responseText);
        const city = response.address.city;
        setCurrCity(city);
      }
    }
  }, [lat, lng, geolocation.loaded]);


  useEffect(() => {
    const options = {
      method: 'GET',
      baseURL: 'https://api.predicthq.com/v1/events/',
      params: {
        'relevance': 'rank,start_around,location_around',
        'start_around.origin': date,
        'location_around.origin': lat + "," + lng,
        'location_around.offset': '5km',
        'location_around.scale': '10km',
        'active.gte': date,
        'category': 'concerts'
      },
      headers: {
        authorization: `Bearer ${auth}`
      }
    };
    if (geolocation.loaded) axios.request(options)
      .then(res => {
        setShows(res.data);
        console.log("res.data~~~~~~~~~: ", res.data);
      })
      .catch(err => {
        console.error(err.message);
      });
  }, [geolocation, date, lat, lng]);


  // results OR empty array seems wrong but need to not map on undefined axios get
  const showMarkers = (shows.results || []).map(show => (
    show.entities.map(venue => (

      <Marker
        key={show.id}
        position={[show.location[1], show.location[0]]}>
        <Popup key={venue.entity_id}>
          {show.title} <br /> {venue.name}
        </Popup>
      </Marker>
    ))
  ));

  console.log("shows~~~~~~~~~: ", shows);

  return (
    <div>
      <h1> {currCity ? "Shows in " +
        currCity : "grabbing your location..."}
      </h1>

      <MapContainer
        center={egypt}
        zoom={1} scrollWheelZoom={true}
      >
        {showMarkers}

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