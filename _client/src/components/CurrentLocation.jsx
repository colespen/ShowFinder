import { useEffect } from 'react';

import { useMap } from 'react-leaflet';
import L from "leaflet";

////    Use Current Location for map Position and circle
const CurrentLocation = ({ geolocation, userData, currCity }) => {
  const map = useMap();

  useEffect(() => {
    if (geolocation.loaded) {
      
      if (currCity) map.flyTo(
        { lat: userData.lat, lng: userData.lng },
        13
      );
      ////    use setView instead of flyTo on page refresh
      // map.setView({ lat: userData.lat, lng: userData.lng }, 12);
      map.on('zoomend', () => {
        //// load position marker after animation
        const circle = L.circle(
          geolocation.coords, geolocation.accuracy + 7,
          {
            color: '#3084c9',
            weight: 0.25,
            opacity: 0.8,
            fillColor: '#0000ff38',
            fillOpacity: 0.15
          });
        const fixCircle = L.circle(
          geolocation.coords,
          {
            radius: 150,
            color: '#3084c9',
            weight: 0.25,
            opacity: 0.8,
            fillColor: '#0000ff38',
            fillOpacity: 0.15
          });
        if (geolocation.accuracy > 25) {
          fixCircle.addTo(map);
        } else {
          circle.addTo(map);
        }
      });
    }

  }, [map, geolocation, userData.lat, userData.lng, currCity]);

  return null;
};

export default CurrentLocation;