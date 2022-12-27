import { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet';
import L from "leaflet";
import useGeoLocation from '../hooks/useGeoLocation';

import './styles.scss';
// import testShows from '../data/test-show-rapid.json';

export default function Map(props) {
  const [shows, setShows] = useState({});
  const [currCity, setCurrCity] = useState(null);
  const [artist, setArtist] = useState("");
  const geolocation = useGeoLocation();

  ////    Set Current Date and maxDate
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

  console.log("shows~~~~~~~~~~~~~: ", shows);

  ////    POST to server for two API calls
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


  ////    Save to localStorage
  useEffect(() => {
    localStorage.setItem('shows', JSON.stringify(shows));
  }, [shows]);
  ////    Get from localStorage and set state
  useEffect(() => {
    const data = localStorage.getItem('shows');
    if (data) setShows(JSON.parse(data));
  }, []);

  ////    Default position
  const egypt =
    [31.403292642948028, 30.853644619611597];

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
  const handleButtonClick = e => {
    // e.preventDefault();
    console.log("artist in handleButton", artist);
    window.open(`https://www.songkick.com/search?utf8=%E2%9C%93&type=initial&query=${artist}&commit=`, '_blank', 'noreferrer');
  };
  ////    Wait until artist state set to trigger
  useEffect(() => {
    handleButtonClick();
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
              <button onClick={handleArtistName} id="artist-button">
                {artist.name}
              </button>
            </li>
          ))}
        </ul>

        <a href={show.location.sameAs}
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