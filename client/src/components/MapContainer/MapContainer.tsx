import {
  MapContainer,
  TileLayer,
  MapContainerProps,
  useMap,
} from "react-leaflet";
import { useEffect } from "react";
import { ContainerProps } from "../../datatypes/props";

import CurrentLocation from "./CurrentLocation";
import ShowMarkers from "./ShowMarkers";
import { centerInitial } from "../../datatypes/initialState";

// iOS Safari fix component - Leaflet 1.9.4+ handles resize automatically
const MapSizeHandler = () => {
  const map = useMap();

  useEffect(() => {
    // Ensure map size is correct after initial render
    map.whenReady(() => {
      console.log("Map is ready, invalidating size...");
      map.invalidateSize();
    });
  }, [map]);

  return null;
};

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
      <MapSizeHandler />
      {geolocation.loaded && <ShowMarkers {...rest} />}

      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
        minZoom={1}
        keepBuffer={4}
        updateWhenIdle={true}
        errorTileUrl="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
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
