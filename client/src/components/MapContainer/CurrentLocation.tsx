import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { centerInitial } from "../../datatypes/initialState";
import { CurrentLocationProps } from "../../datatypes/props";

////    Use Current Location for map Position and circle
const CurrentLocation = (props: CurrentLocationProps) => {
  const { geolocation, userData, currCity, center, isMarkerClicked } = props;
  const map = useMap();
  
  // center on Maker when clicked from drawer
  useEffect(() => {
    const centerVals = Object.values(center);
    if (
      geolocation.loaded &&
      isMarkerClicked &&
      centerVals[0] !== centerInitial[0] &&
      centerVals[1] !== centerInitial[1]
    ) {
      map.flyTo({ ...center }, 13);
    }
  }, [center, geolocation.loaded, isMarkerClicked, map]);

  useEffect(() => {
    if (geolocation.loaded) {
      if (currCity) map.flyTo({ lat: userData.lat, lng: userData.lng }, 13);
      //// TODO: use setView instead of flyTo on page refresh
      // map.setView({ lat: userData.lat, lng: userData.lng }, 12);
      map.on("zoomend", () => {
        //// load position marker after animation
        const circle = L.circle(geolocation.coords, geolocation.accuracy + 7, {
          color: "#3084c9",
          weight: 0.25,
          opacity: 0.8,
          fillColor: "#0000ff38",
          fillOpacity: 0.15,
        });
        const fixCircle = L.circle(geolocation.coords, {
          radius: 150,
          color: "#3084c9",
          weight: 0.25,
          opacity: 0.8,
          fillColor: "#0000ff38",
          fillOpacity: 0.15,
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
