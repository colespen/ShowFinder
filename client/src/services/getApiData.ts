import axios from "axios";
import { cityFilter, hasValidCoords } from "../helpers/utils";
import {
  GetShowsArgs,
  SetShowCityUserDataArgs,
  SetNewShowCityUserDataArgs,
  GetCurrLocationShowsArgs,
  GetNewCityShowsArgs,
  GetNewDateRangeShowsArgs,
  ShowCallbackArgs,
} from "../datatypes/apiDataArgs";
import { Coords } from "../datatypes/locationData";
import { UserDataState } from "../datatypes/userData";

axios.defaults.baseURL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8001/";

const setShowCityUserData = (args: SetShowCityUserDataArgs) => {
  const { data, callbacks } = args;
  const { setShows, setCurrCity, setUserData } = callbacks;
  setShows({
    data: data.data || [],
    currentAddress: data.currentAddress || {},
    page: data.page,
  });
  setCurrCity(data.currentAddress?.address?.city || "");
  if (data.currentAddress) {
    setUserData((prev) => ({ ...prev, currentAddress: data.currentAddress }));
  }
};

const setNewShowCityUserData = (args: SetNewShowCityUserDataArgs) => {
  const { data, callbacks, cityQuery } = args;
  const { setShows, setCurrCity, setUserData } = callbacks;
  setShows({
    data: data.data || [],
    currentAddress: data.currentAddress || {},
    page: data.page,
  });
  if (cityQuery !== undefined) setCurrCity(cityFilter(cityQuery));
  if (data.latLng?.[0]) {
    setUserData((prev) => ({
      ...prev,
      lat: data.latLng[0].lat,
      lng: data.latLng[0].lon,
    }));
  }
};

const fetchShows = (
  params: UserDataState & (Coords | undefined),
  callbacks: ShowCallbackArgs
) => {
  if (!hasValidCoords(params.lat, params.lng)) {
    return;
  }
  axios
    .get("/api/shows", { params })
    .then((res) => {
      setShowCityUserData({
        data: res.data,
        callbacks,
      });
    })
    .catch((err) => console.log(err.message));
};

const fetchNewShows = (
  userData: UserDataState,
  cityQuery: string,
  callbacks: ShowCallbackArgs
) => {
  axios
    .get("/api/newshows", { params: { ...userData, newCity: cityQuery } })
    .then((res) => {
      setNewShowCityUserData({
        data: res.data,
        cityQuery,
        callbacks,
      });
    })
    .catch((err) => console.log(err.message));
};

const getArtistPreview = (
  artist: string,
  setAudioLink: (state: string) => void,
  setIsPlaying: (state: boolean) => void,
  setNowPlaying: (state: string) => void,
  setItunesUrl: (state: string) => void
) => {
  axios
    .get("/api/preview", { params: { artist } })
    .then((response) => {
      const previewUrl = response.data?.previewUrl || "";
      setAudioLink(previewUrl);
      setNowPlaying(response.data?.trackName || "");
      setItunesUrl(response.data?.itunesUrl || "");
      if (!previewUrl) {
        setIsPlaying(false);
      }
    })
    .catch((err) => {
      console.log(err.message);
      setAudioLink("");
      setItunesUrl("");
      setIsPlaying(false);
    });
};

const getShows = (args: GetShowsArgs) => {
  const { userData, geolocation, callbacks } = args;
  const { setShows, setCurrCity, setUserData } = callbacks;
  const coords = geolocation.coords;
  if (!hasValidCoords(coords.lat, coords.lng)) {
    return;
  }
  fetchShows(
    {
      ...userData,
      ...coords,
    },
    { setShows, setCurrCity, setUserData }
  );
};

const getCurrLocationShows = (args: GetCurrLocationShowsArgs) => {
  const { userData, geolocation, callbacks } = args;
  const { setShows, setCurrCity, setTransition, setUserData } = callbacks;
  if (!hasValidCoords(geolocation.coords.lat, geolocation.coords.lng)) {
    return;
  }
  setCurrCity("");
  setTransition({ opacity: 1, type: "location" });
  setUserData((prev) => ({
    ...prev,
    ...geolocation.coords,
  }));
  if (geolocation.loaded) {
    fetchShows(
      {
        ...userData,
        ...geolocation.coords,
      },
      { setShows, setCurrCity, setUserData }
    );
  }
};

const getNewCityShows = (args: GetNewCityShowsArgs) => {
  const { userData, callbacks } = args;
  const { setShows, setCurrCity, setTransition, setUserData, setCityQuery } =
    callbacks;

  if (userData.newCity) {
    setCurrCity("");
    setCityQuery(userData.newCity);
    setTransition({ opacity: 1, type: "shows" });
    fetchNewShows({ ...userData }, userData.newCity, {
      setShows,
      setCurrCity,
      setUserData,
    });
  }
};

const getNewDateRangeShows = (args: GetNewDateRangeShowsArgs) => {
  const { userData, currCity, cityQuery, callbacks } = args;
  const {
    setShows,
    setUserData,
    setCurrCity,
    handleNewCityShows,
    setCityQuery,
    setTransition,
  } = callbacks;

  const prevCity = currCity;
  const filterUserCity = cityFilter(userData.currentAddress.address.city);

  if (Object.keys(userData.dateRange).length === 2) {
    setCurrCity("");
    setTransition({ opacity: 1, type: "dates" });

    if (userData.newCity === "" && currCity === filterUserCity) {
      fetchShows({ ...userData }, { setShows, setCurrCity, setUserData });
    } else if (userData.newCity && cityFilter(userData.newCity) !== prevCity) {
      handleNewCityShows();
      setCityQuery(userData.newCity);
    } else {
      if (userData.newCity) setCityQuery(userData.newCity);
      fetchNewShows({ ...userData }, cityQuery, {
        setShows,
        setCurrCity,
        setUserData,
      });
    }
  }
};

export {
  getShows,
  getNewCityShows,
  getCurrLocationShows,
  getNewDateRangeShows,
  getArtistPreview,
};
