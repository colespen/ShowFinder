import { MapContainer, TileLayer } from 'react-leaflet';

import CurrentLocation from './CurrentLocation';
import ShowMarkers from './ShowMarkers';

//////    Default position
const budapest = [47.51983881388099, 19.032783326057594];

const Container = (props) => {
  const {
    geolocation,
    userData,
    currCity,
    ...rest
  } = props;

  return (
    <MapContainer className="map-container"
      center={budapest}
      zoom={2.5} scrollWheelZoom={true}
    >
      {geolocation.loaded &&
        <ShowMarkers
          {...rest}
        />}

      <TileLayer
        attribution=
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <CurrentLocation
        geolocation={geolocation}
        userData={userData}
        currCity={currCity}
      />
    </MapContainer>
  );
};

export default Container;