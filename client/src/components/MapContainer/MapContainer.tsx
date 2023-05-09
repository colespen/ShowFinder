import { MapContainer, TileLayer, MapContainerProps } from "react-leaflet";
import { ContainerProps } from "../../datatypes/props";

import CurrentLocation from "./CurrentLocation";
import ShowMarkers from "./ShowMarkers";

const MapContainerComponent = (props: MapContainerProps & ContainerProps) => {
  const { geolocation, userData, currCity, ...rest } = props;

  //////    Default position
  const budapest: [number, number] = [47.51983881388099, 19.032783326057594];

  return (
    <MapContainer
      className="map-container"
      center={budapest}
      zoom={2.5}
      scrollWheelZoom={true}
    >
      {geolocation.loaded && <ShowMarkers {...rest} />}

      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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

export default MapContainerComponent;