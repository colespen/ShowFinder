import { MapContainer, TileLayer, MapContainerProps, useMapEvents } from "react-leaflet";
import { useEffect, useCallback } from "react";
import { ContainerProps } from "../../datatypes/props";

import CurrentLocation from "./CurrentLocation";
import ShowMarkers from "./ShowMarkers";
import { centerInitial } from "../../datatypes/initialState";

// Production-ready iOS Safari fix component
const MapSizeHandler = () => {
  const map = useMapEvents({
    // Use Leaflet's native load event for proper initialization
    load: () => {
      // Map is fully initialized, safe to invalidate size
      map.invalidateSize();
    },
    resize: () => {
      // Built-in resize event handler
      map.invalidateSize();
    }
  });

  const handleResize = useCallback(() => {
    // Use requestAnimationFrame for better performance
    requestAnimationFrame(() => {
      map.invalidateSize();
    });
  }, [map]);

  const handleOrientationChange = useCallback(() => {
    // Slight delay for orientation change to complete
    requestAnimationFrame(() => {
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    });
  }, [map]);

  useEffect(() => {
    // Use Leaflet's whenReady for proper initialization timing
    map.whenReady(() => {
      map.invalidateSize();
    });

    // Handle browser-level resize and orientation events
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleOrientationChange, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [map, handleResize, handleOrientationChange]);

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
