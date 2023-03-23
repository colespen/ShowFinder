import { useState, useEffect } from "react";

/**
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/GeolocationPositionError}
 */
export const NAVIGTOR_ERROR = {
  PERMISSION_DENIED: 1,
  POSITION_UNAVAILABLE: 2,
  TIMEOUT: 3
};

/**
 * React hook returns user's geolocation
 */
export default function useGeoLocation(reloadOnError = false) {
  const [location, setLocation] = useState({
    loaded: false,
    coords: { lat: "", lng: "" },
    accuracy: 0,
    error: undefined,
    access: false,
    isClick: false
  });


  useEffect(() => {
    navigator.permissions.query({ name: 'geolocation' })
      .then((status) => {
        if (status.state === "granted") {
          setLocation(prev => (
            {
              ...prev,
              access: status.state === "granted"
            }
          ));
        }
        status.onchange = () => {
          setLocation(prev => (
            {
              ...prev,
              access: status.state === "granted",
              isClick: true
            }
          ));
        };
      });

    const onSuccess = location => {
      setLocation(prev => (
        {
          ...prev,
          loaded: true,
          accuracy: location.coords.accuracy,
          coords: {
            lat: '48.87330892927665',
            lng: '2.350468227636817'
          }
        }
        ));
    };

    const onError = error => {
      // if (error.code === NAVIGTOR_ERROR.PERMISSION_DENIED) {
      //   alert("please allow location in settings to continue.");
      // }
      setLocation({
        loaded: true,
        error: {
          code: error.code,
          message: error.message,
        },
      });
    };

    if (!("geolocation" in navigator)) {
      onError({
        code: 0,
        message: "Geolocation not supported"
      });
    }

    navigator.geolocation.getCurrentPosition(onSuccess, onError);
  }, [reloadOnError]);

  return location;
}