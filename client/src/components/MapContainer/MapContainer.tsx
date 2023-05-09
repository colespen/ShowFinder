import { MapContainer, TileLayer, MapContainerProps } from "react-leaflet";
import { ContainerProps } from "../../datatypes/props";

import CurrentLocation from "./CurrentLocation";
import ShowMarkers from "./ShowMarkers";
import { centerInitial } from "../../datatypes/initialState";

const MapContainerComponent = (props: MapContainerProps & ContainerProps) => {
  const { isMarkerClicked, center, geolocation, userData, currCity, ...rest } =
    props;

  return (
    <MapContainer
      className="map-container"
      center={centerInitial}
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
        center={center}
        isMarkerClicked={isMarkerClicked}
      />
    </MapContainer>
  );
};

export default MapContainerComponent;
