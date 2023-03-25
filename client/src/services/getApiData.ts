import axios from "axios";
import { cityFilter } from "../helpers/utils";
import {
  GetShowsArgs,
  SetShowCityUserDataArgs,
  getCurrLocationShowsArgs,
  getNewCityShowsRequestArgs,
  getNewDateRangeShowsArgs,
} from "../datatypes/apiDataArgs";

////// use Render.com server ******
axios.defaults.baseURL = "https://showfinder-server.onrender.com/";

// helper to setStates
const setShowCityUserData = (props: SetShowCityUserDataArgs) => {
  const { data, setShows, setCurrCity, setUserData } = props;
  setShows(data);
  setCurrCity(data.currentAddress.address.city);
  setUserData((prev) => ({ ...prev, currentAddress: data.currentAddress }));
};

////////////////////////////////////////////////////////////////////
//////    Calls to Server for Geo and Shows API
//////////////////////////////////////////////////////////////////

/**
 * POST - api/spotifyauth - retrieve spotifyToken in API
 */
const getSpotifyToken = () => {
  axios
    .post("/api/spotifyauth")
    .then((response) => {})
    .catch((err) => console.log(err.message));
};

/**
 * GET - api/spotifysample - get artist ID
 * then get preview data w spotifyToken
 */
const getSpotifySample = (
  artist: string,
  setAudioLink: (state: string) => void,
  setIsPlaying: (state: boolean) => void
) => {
  axios
    .get("/api/spotifysample", { params: { artist } })
    .then((response) => {
      setAudioLink(response.data.topTrack);
      setIsPlaying(false);
    })
    .catch((err) => console.log(err.message));
};

/**
 * GET - /api/shows - reverse geocode current coords then get shows
 */
const getShows = (args: GetShowsArgs) => {
  const { userData, geolocation, setShows, setCurrCity, setUserData } = args;
  axios
    .get("/api/shows", {
      params: {
        ...userData,
        ...geolocation.coords,
      },
    })
    .then((res) => {
      // incl. in obj for interface { }
      setShowCityUserData({
        data: res.data,
        setShows,
        setCurrCity,
        setUserData,
      });
    })
    .catch((err) => console.log(err.message));
};

/**
 * GET - /api/shows - current location rev geo then shows - onClick
 */
const getCurrLocationShows = (args: getCurrLocationShowsArgs) => {
  const {
    setShows,
    setCurrCity,
    setTransition,
    setUserData,
    geolocation,
    userData,
  } = args;
  setCurrCity("");
  setTransition({ opacity: 1, type: "location" });
  setUserData((prev) => ({
    ...prev,
    ...geolocation.coords,
  }));
  if (geolocation.loaded) {
    axios
      .get("/api/shows", {
        params: {
          ...userData,
          ...geolocation.coords,
        },
      })
      .then((res) => {
        setShowCityUserData({
          data: res.data,
          setShows,
          setCurrCity,
          setUserData,
        });
      })
      .catch((err) => console.log(err.message));
  }
};

/**
 * GET - /api/newshows - fwd geo then new shows
 */
const getNewCityShowsRequest = (args: getNewCityShowsRequestArgs) => {
  const {
    setShows,
    setCurrCity,
    setTransition,
    setUserData,
    userData,
    setCityQuery,
  } = args;

  if (userData.newCity) {
    setCurrCity("");
    setCityQuery(userData.newCity);
    setTransition({ opacity: 1, type: "shows" });

    axios
      .get("/api/newshows", { params: userData })
      .then((res) => {
        setShows(res.data);
        setCurrCity(cityFilter(userData.newCity));
        setUserData((prev) => ({
          ...prev,
          lat: res.data.latLng[0].lat,
          lng: res.data.latLng[0].lon,
        }));
      })
      .catch((err) => console.log(err.message));
  }
  // return () => clearTimeout(titleDelay)
};

/**
 * GET - /api/shows - date range rev geo shows
 */
const getNewDateRangeShows = (args: getNewDateRangeShowsArgs) => {
  const {
    setShows,
    setUserData,
    currCity,
    setCurrCity,
    handleNewCityShowsRequest,
    setCityQuery,
    cityQuery,
    setTransition,
    userData,
  } = args;

  const prevCity = currCity;
  const filterUserCity = cityFilter(userData.currentAddress.address.city);

  if (Object.keys(userData.dateRange).length === 2) {
    setCurrCity("");
    setTransition({ opacity: 1, type: "dates" });

    if (userData.newCity === "" && currCity === filterUserCity) {
      axios
        .get("/api/shows", { params: userData })
        .then((res) => {
          setShowCityUserData({
            data: res.data,
            setShows,
            setCurrCity,
            setUserData,
          });
        })
        .catch((err) => console.log(err.message));
    } else if (userData.newCity && cityFilter(userData.newCity) !== prevCity) {
      handleNewCityShowsRequest();
      setCityQuery(userData.newCity);
    } else {
      if (userData.newCity) setCityQuery(userData.newCity);
      axios
        .get("/api/newshows", { params: { ...userData, newCity: cityQuery } })
        .then((res) => {
          setShows(res.data);
          setCurrCity(cityFilter(cityQuery));
          setUserData((prev) => ({
            ...prev,
            lat: res.data.latLng[0].lat,
            lng: res.data.latLng[0].lon,
          }));
        })
        .catch((err) => console.log(err.message));
    }
  }
};

export {
  getShows,
  getNewCityShowsRequest,
  getCurrLocationShows,
  getNewDateRangeShows,
  getSpotifyToken,
  getSpotifySample,
};
