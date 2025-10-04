import {
  MapContainer,
  TileLayer,
  MapContainerProps,
  useMapEvents,
} from "react-leaflet";
import { useEffect, useCallback, useRef } from "react";
import { ContainerProps } from "../../datatypes/props";

import CurrentLocation from "./CurrentLocation";
import ShowMarkers from "./ShowMarkers";
import { centerInitial } from "../../datatypes/initialState";

// iOS Safari fix component
const MapSizeHandler = () => {
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const map = useMapEvents({
    resize: () => {
      // debounce resize to avoid excessive invalidateSize calls
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      resizeTimeoutRef.current = setTimeout(() => {
        console.log("Map resize event - invalidating map size");
        map.invalidateSize();
      }, 150);
    },
  });

  const handleOrientationChange = useCallback(() => {
    // delay for orientation change to complete
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [map]);

  useEffect(() => {
    // delay invalidateSize until Safari finishes initial layout - prevents "top rectangle only" tile bug on iOS Safari
    requestAnimationFrame(() => {
      setTimeout(() => {
        map.invalidateSize();
      }, 0);
    });

    // only handle orientation change (resize is handled by Leaflet's resize event)
    window.addEventListener("orientationchange", handleOrientationChange, {
      passive: true,
    });

    return () => {
      window.removeEventListener("orientationchange", handleOrientationChange);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [map, handleOrientationChange]);

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
