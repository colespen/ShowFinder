import axios from 'axios';
import { cityFilter } from '../helpers/utils';

////// use Render.com server ******
axios.defaults.baseURL = 'https://showfinder-server.onrender.com/';

// helper to setStates
const setShowCityUserData =
  (data, setShows, setCurrCity, setUserData) => {
    setShows(data);
    setCurrCity(data.currentAddress.address.city);
    setUserData(prev => (
      { ...prev, currentAddress: data.currentAddress })
    );
  };

////////////////////////////////////////////////////////////////////
//////    Calls to Server for Geo and Shows API 
//////////////////////////////////////////////////////////////////

/** POST - api/spotifyauth - retrieve spotifyToken in API
*/
const getSpotifyToken = () => {
  axios.post('/api/spotifyauth')
    .then((response) => { })
    .catch(err => console.log(err.message));
};

/** GET - api/spotifysample - get artist ID 
 * then get preview data w spotifyToken
*/
const getSpotifySample = (artist, setAudioLink, setIsPlaying) => {
  axios.get('/api/spotifysample', { params: { artist } })
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
      }
    }
  })
    .catch(err => console.log(err.message));
};

/** GET - /api/shows - reverse geocode current coords then get shows
*/
const getShows = (
  userData, geolocation, setShows, setCurrCity, setUserData) => {
  axios.get('/api/shows', {
    params: {
      ...userData,
      ...geolocation.coords
    }
  })
    .then((res) => {
      setShowCityUserData(res.data, setShows, setCurrCity, setUserData);
    })
    .catch(err => console.log(err.message));
};

/** GET - /api/shows - current location rev geo then shows - onClick
*/
const getCurrLocationShows = (args) => {
  const { setShows, setCurrCity, setTransition,
    setUserData, geolocation, userData } = args;
  setCurrCity("");
  setTransition({ opacity: 1, type: "location" });
  setUserData(prev => ({
    ...prev,
    ...geolocation.coords
  }));
  if (geolocation.loaded) {
    axios.get('/api/shows', {
      params: {
        ...userData,
        ...geolocation.coords
      }
    })
      .then((res) => {
        setShowCityUserData(res.data, setShows, setCurrCity, setUserData);
      })
      .catch(err => console.log(err.message));
  }
};

/** GET - /api/newshows - fwd geo then new shows
*/
const getNewCityShowsRequest = (args) => {
  const { userData, setCurrCity, setCityQuery,
    setTransition, setShows, setUserData } = args;

  if (userData.newCity) {
    setCurrCity("");
    setCityQuery(userData.newCity);
    setTransition({ opacity: 1, type: "shows" });

    axios.get('/api/newshows', { params: userData })
      .then((res) => {
        setShows(res.data);
        setCurrCity(cityFilter(userData.newCity));
        setUserData((prev) => ({
          ...prev,
          lat: res.data.latLng[0].lat,
          lng: res.data.latLng[0].lon,
        }));
      })
      .catch(err => console.log(err.message));
  };
  // return () => clearTimeout(titleDelay)
};

/** GET - /api/shows - date range rev geo shows
 */
const getNewDateRangeShows = (args) => {
  const { setShows, setUserData, currCity, setCurrCity,
    handleNewCityShowsRequest, setCityQuery, cityQuery,
    setTransition, userData } = args;

  const prevCity = currCity;
  const filterUserCity = cityFilter(userData.currentAddress.address.city);

  if ((Object.keys(userData.dateRange).length === 2)) {
    setCurrCity("");
    setTransition({ opacity: 1, type: "dates" });

    if (userData.newCity === "" && currCity === filterUserCity) {
      axios.get('/api/shows', { params: userData })
        .then((res) => {
          setShowCityUserData(res.data, setShows, setCurrCity, setUserData);
        })
        .catch(err => console.log(err.message));

    } else if (userData.newCity && cityFilter(userData.newCity) !== prevCity) {
      handleNewCityShowsRequest();
      setCityQuery(userData.newCity);
    } else {

      if (userData.newCity) setCityQuery(userData.newCity);
      axios.get('/api/newshows', { params: { ...userData, newCity: cityQuery } })
        .then((res) => {
          setShows(res.data);
          setCurrCity(cityFilter(cityQuery));
          setUserData((prev) => ({
            ...prev,
            lat: res.data.latLng[0].lat,
            lng: res.data.latLng[0].lon,
          }));
        })
        .catch(err => console.log(err.message));
    }
  }
};

export {
  getShows,
  getNewCityShowsRequest,
  getCurrLocationShows,
  getNewDateRangeShows,
  getSpotifyToken,
  getSpotifySample
};