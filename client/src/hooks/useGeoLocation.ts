import { useState, useEffect } from "react";
import { GeoLocationState, onSuccessGeo } from "../datatypes/locationData";

/**
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/GeolocationPositionError}
 */
export const NAVIGTOR_ERROR = {
  PERMISSION_DENIED: 1,
  POSITION_UNAVAILABLE: 2,
  TIMEOUT: 3,
};

/**
 * React hook returns user's geolocation in location state object
 */
export default function useGeoLocation(reloadOnError = false): GeoLocationState {
  const [location, setLocation] = useState<GeoLocationState>({
    loaded: false,
    coords: { lat: 0, lng: 0 },
    accuracy: 0,
    error: undefined,
    access: false,
    isClick: false,
  });

  useEffect(() => {
    navigator.permissions.query({ name: "geolocation" }).then((status) => {
      if (status.state === "granted") {
        setLocation((prev) => ({
          ...prev,
          access: status.state === "granted",
        }));
      }
      status.onchange = () => {
        setLocation((prev) => ({
          ...prev,
          access: status.state === "granted",
          isClick: true,
        }));
      };
    });

    const onSuccess = (location: onSuccessGeo) => {
      setLocation((prev) => ({
        ...prev,
        loaded: true,
        accuracy: location.coords.accuracy,
        coords: {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
          //might need to change .toString() and above Interface
        },
      }));
    };

    const onError = (
      error: { code: number; message: any } = {
        //default value
        code: 0,
        message: "Unknown error",
      }
    ) => {
      // if (error.code === NAVIGTOR_ERROR.PERMISSION_DENIED) {
      //   alert("please allow location in settings to continue.");
      // }
      setLocation((prev) => ({
        ...prev,
        loaded: true,
        error: {
          code: error.code,
          message: error.message,
        },
      }));
    };

    if (!("geolocation" in navigator)) {
      onError({
        code: 0,
        message: "Geolocation not supported",
      });
    }

    const options = {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 0,
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
  }, [reloadOnError]);

  return location;
}
