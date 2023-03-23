import axios from 'axios';

import { cityFilter } from '../helpers/utils';

////// use Render.com server ******
axios.defaults.baseURL = 'https://showfinder-server.onrender.com/';

// helper to setState
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
      setAudioLink(response.data.topTrack);
      setIsPlaying(false);
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
const getCurrLocationShows = (
  setShows, setCurrCity, setTransition, setUserData, geolocation, userData) => {
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
const getNewCityShowsRequest = (
  userData, setCurrCity, setTransition, setShows, setUserData) => {
  if (userData.newCity) {
    setCurrCity("");
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
};

/** GET - /api/shows - date range rev geo shows
*/
const getNewDateRangeShows = (
  setShows, setUserData, setCurrCity, setTransition, userData, handleNewCityShowsRequest) => {
  if ((Object.keys(userData.dateRange).length === 2)) {
    setCurrCity("");
    setTransition({ opacity: 1, type: "dates" });

    if (userData.newCity === "") {
      axios.get('/api/shows', { params: userData })
        .then((res) => {
          setShowCityUserData(res.data, setShows, setCurrCity, setUserData);
        })
        .catch(err => console.log(err.message));
    } else {
      handleNewCityShowsRequest();
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