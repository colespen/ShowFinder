import { useState, useEffect } from "react";

export default function useGeoLocation() {
  const [location, setLocation] = useState({
    loaded: false,
    coords: { lat: "", lng: "" },
    accuracy: 0
  });

  const onSuccess = location => {
    setLocation({
      loaded: true,
      accuracy: location.coords.accuracy,
      coords: {
        lat: location.coords.latitude,
        lng: location.coords.longitude
      }
    });
  };

  const onError = err => {
    setLocation({
      loaded: true,
      err: {
        code: err.code,
        message: err.message,
      },
    });
  };

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      onError({
        code: 0,
        message: "Geolocation not supported"
      });
    }

    navigator.geolocation.getCurrentPosition(onSuccess, onError);
  }, []);
  return location;
}