import axios from "axios";
import { cityFilter } from "../helpers/utils";
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

////// use Render.com server ******
// axios.defaults.baseURL = "https://showfinder-server.onrender.com/";
axios.defaults.baseURL = "http://localhost:8001/";

/**
 * helper - set state in setShows, setCurrCity and setUserData
 */
const setShowCityUserData = (args: SetShowCityUserDataArgs) => {
  const { data, callbacks } = args;
  const { setShows, setCurrCity, setUserData } = callbacks;
  setShows(data);
  setCurrCity(data.currentAddress.address.city);
  setUserData((prev) => ({ ...prev, currentAddress: data.currentAddress }));
};

/**
 * helper - set new coords in setUserData, and set state in setShows, setCurrCity
 */
const setNewShowCityUserData = (args: SetNewShowCityUserDataArgs) => {
  const { data, callbacks, cityQuery } = args;
  const { setShows, setCurrCity, setUserData } = callbacks;
  setShows(data);
  if (cityQuery !== undefined) setCurrCity(cityFilter(cityQuery));
  setUserData((prev) => ({
    ...prev,
    lat: data.latLng[0].lat,
    lng: data.latLng[0].lon,
  }));
};

////////////////////////////////////////////////////////////////////
//////    Calls to Server for Geo and Shows API
//////////////////////////////////////////////////////////////////

/**
 * GET - /api/shows & setShowCityUserData
 */
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
 * GET - /api/newshows & setShowCityUserData
 */
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
      // take first preview_url that isn't null then exit
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

///////////////////////////////////////////////////////

/**
 * Get reverse geocode current coords then get shows
 */
const getShows = (args: GetShowsArgs) => {
  const { userData, geolocation, callbacks } = args;
  const { setShows, setCurrCity, setUserData } = callbacks;
  //
  fetchShows(
    {
      ...userData,
      ...geolocation.coords,
    },
    { setShows, setCurrCity, setUserData }
  );
};

/**
 * Get current location rev geo then shows - onClick
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
 * Get forward geo then new shows
 */
const getNewCityShows = (args: GetNewCityShowsArgs) => {
  const { userData, callbacks } = args;
  const { setShows, setCurrCity, setTransition, setUserData, setCityQuery } =
    callbacks;

  if (userData.newCity) {
    setCurrCity("");
    setCityQuery(userData.newCity);
    setTransition({ opacity: 1, type: "shows" });
    //
    fetchNewShows({ ...userData }, userData.newCity, {
      setShows,
      setCurrCity,
      setUserData,
    });
  }
};

/**
 * Get date range reverse geo shows
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
      //
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
  getSpotifyToken,
  getSpotifySample,
};
