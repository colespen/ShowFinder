import axios from "axios";
import { cityFilter } from "../helpers/utils";
import {
  GetShowsArgs,
  SetShowCityUserDataArgs,
  GetCurrLocationShowsArgs,
  GetNewCityShowsArgs,
  GetNewDateRangeShowsArgs,
  ShowCallbackArgs,
} from "../datatypes/apiDataArgs";
import { Coords } from "../datatypes/locationData";
import { UserDataState } from "../datatypes/userData";

////// use Render.com server ******
// axios.defaults.baseURL = "https://showfinder-server.onrender.com/";
axios.defaults.baseURL = "http://localhost:8001/";

// helper to setStates
const setShowCityUserData = (args: SetShowCityUserDataArgs) => {
  const { data, callbacks } = args;
  const { setShows, setCurrCity, setUserData } = callbacks;
  setShows(data);
  setCurrCity(data.currentAddress.address.city);
  setUserData((prev) => ({ ...prev, currentAddress: data.currentAddress }));
};

////////////////////////////////////////////////////////////////////
//////    Calls to Server for Geo and Shows API
//////////////////////////////////////////////////////////////////

const fetchShows = (
  params: UserDataState & (Coords | undefined),
  callbacks: ShowCallbackArgs
) => {
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
      const tracks = response.data.tracks;
      if (tracks.length === 0) {
        setAudioLink("");
        throw new Error("No tracks found");
      }
      for (let i = 0; i < tracks.length; i++) {
        if (tracks[i].preview_url) {
          setAudioLink(tracks[i].preview_url);
          setIsPlaying(false);
          break;
        } else {
          setAudioLink("");
          // setIsPlaying(false);
        }
      }
    })
    .catch((err) => console.log(err.message));
};

/**
 * GET - /api/shows - reverse geocode current coords then get shows
 */
const getShows = (args: GetShowsArgs) => {
  const { userData, geolocation, callbacks } = args;
  const { setShows, setCurrCity, setUserData } = callbacks;

  fetchShows(
    {
      ...userData,
      ...geolocation.coords,
    },
    { setShows, setCurrCity, setUserData }
  );
};

/**
 * GET - /api/shows - current location rev geo then shows - onClick
 */
const getCurrLocationShows = (args: GetCurrLocationShowsArgs) => {
  const { userData, geolocation, callbacks } = args;
  const { setShows, setCurrCity, setTransition, setUserData } = callbacks;
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

/**
 * GET - /api/newshows - fwd geo then new shows
 */
const getNewCityShows = (args: GetNewCityShowsArgs) => {
  const { userData, callbacks } = args;
  const { setShows, setCurrCity, setTransition, setUserData, setCityQuery } =
    callbacks;

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
};

/**
 * GET - /api/shows - date range rev geo shows
 */
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
  getNewCityShows,
  getCurrLocationShows,
  getNewDateRangeShows,
  getSpotifyToken,
  getSpotifySample,
};
