import { useState, useEffect, useRef } from "react";
import useGeoLocation, { NAVIGTOR_ERROR } from "../hooks/useGeoLocation";
import MapContainerComponent from "./MapContainer/MapContainer";
import Title from "./Title";
import ControlsTop from "./ControlsTop";
import ControlsBottom from "./ControlsBottom/ControlsBottom";
import DrawerLeft from "./DrawerLeft/DrawerLeft";
import {
  getShows,
  getSpotifyToken,
  getSpotifySample,
  getNewCityShows,
  getCurrLocationShows,
  getNewDateRangeShows,
} from "../services/getApiData";
import { UserDataState } from "../datatypes/userData";
import { ShowData, ShowDataState } from "../datatypes/showData";
import {
  centerStateInitial,
  transitionInitial,
  userDataInitial,
} from "../datatypes/initialState";
import { handleSetArtist, handleSetNewAudio } from "../helpers/eventHandlers";
import "./styles.scss";
import { Marker } from "leaflet";
import { setArtistNameFilter } from "../helpers/utils";

export default function Map() {
  const [shows, setShows] = useState<ShowDataState>({
    currentAddress: {},
    data: [],
    page: 0,
  });
  const [currCity, setCurrCity] = useState<string>("");
  const [cityQuery, setCityQuery] = useState<string>("");
  const [artist, setArtist] = useState<string>("");
  const [audioLink, setAudioLink] = useState<string>("");
  const [newAudio, setNewAudio] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isAutoPlay, setIsAutoplay] = useState<boolean>(true);
  const [isMarkerClicked, setIsMarkerClicked] = useState<boolean>(false);
  // this isGeoError to render text in title upon geo error
  // const [isGeoError, setIsGeoError] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserDataState>(userDataInitial);
  const [transition, setTransition] = useState(transitionInitial);
  const [lastClickedMarker, setLastClickedMarker] = useState<string | null>(
    null
  );
  const isFirstRender = useRef<boolean>(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const markerRefs = useRef<Marker[]>([]);
  const [center, setCenter] = useState<{ lat: number; lng: number }>(
    centerStateInitial
  );

  const geolocation = useGeoLocation();

  //////   Set Geo Coords State After Allow Access - First Render
  useEffect(() => {
    if (geolocation.error?.code === NAVIGTOR_ERROR.PERMISSION_DENIED) {
      // setIsGeoError(true);
    }
    if (geolocation.loaded && isFirstRender.current && userData.lat === 0) {
      ////  Assign User's Current Coords
      setUserData((prev) => ({
        ...prev,
        ...geolocation.coords,
      }));
      isFirstRender.current = false;
      return;
    }
  }, [
    isFirstRender,
    geolocation.coords,
    geolocation.loaded,
    userData.lat,
    geolocation.error,
  ]);

  useEffect(() => {
    if (!isFirstRender.current) {
      setNewAudio(true);
      // localStorage.setItem("audioLink", JSON.stringify(audioLink));
    }
  }, [audioLink]);

  // Load Media for Playback with Ref when new audioLink
  useEffect(() => {
    if (audioRef.current && audioLink && isAutoPlay) {
      audioRef.current.load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioLink]);

  ////////////////////////////////////////////////////////////////////
  //////    Calls to Server for Geo and Shows API
  //////////////////////////////////////////////////////////////////
  const args = {
    geolocation,
    userData,
    currCity,
    cityQuery,
  };
  const callbacks = {
    setUserData,
    setShows,
    setCurrCity,
    setCityQuery,
    setTransition,
  };

  // //////    GET Current Location Shows/Geo/spotifyToken - First Render
  useEffect(() => {
    //                      changed from (shows) to (shows.data)
    if (geolocation.loaded && Object.keys(shows.data).length === 0) {
      //////    GET - /api/shows - rev geocode current coords then get shows
      getShows({
        userData,
        geolocation,
        callbacks: { setShows, setCurrCity, setUserData },
      });
      //////    POST - api/spotifyauth - retrieve spotifyToken in API
      getSpotifyToken();
    }
    // removed userData and shows from // }, [...]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geolocation]);

  //////    GET - current location shows and geo
  const handleCurrLocation = () =>
    getCurrLocationShows({ ...args, callbacks: { ...callbacks } });

  //////    GET - /api/newshows - fwd geo then new shows
  const handleNewCityShows = () =>
    getNewCityShows({ ...args, callbacks: { ...callbacks } });

  //////    GET - /api/shows - date range rev geo shows
  const handleDateRangeShows = () =>
    getNewDateRangeShows({
      ...args,
      callbacks: { ...callbacks, handleNewCityShows },
    });

  //////    GET - api/spotifysample - artist ID then get preview data
  useEffect(() => {
    if (artist) getSpotifySample(artist, setAudioLink, setIsPlaying);
    if (!artist) setAudioLink("");
  }, [artist]);

  //////////////////////////////////////////////////////////////////
  //////
  ////////////////////////////////////////////////////////////////////

  /**
   * handles audio playback when artist name is set or changes
   */
  const handleMarkerPlayback = (show: ShowData) => {
    if (show) {
      const headliner = setArtistNameFilter(show);
      setIsMarkerClicked(true);
      handleSetArtist(headliner, shows, setArtist);
      setLastClickedMarker(headliner);
      if (headliner !== lastClickedMarker) {
        handleSetNewAudio(setNewAudio, audioLink);
      }
    } else {
      throw Error("insufficient show data!");
    }
  };

  return (
    <div className="map-main">
      <Title
        currCity={currCity}
        isFirstRender={isFirstRender.current}
        transition={transition}
        geolocation={geolocation}
        // isGeoError={isGeoError}
      />
      <ControlsTop
        setUserData={setUserData}
        handleNewCityShows={handleNewCityShows}
        handleCurrLocation={handleCurrLocation}
        handleDateRangeShows={handleDateRangeShows}
      />
      <MapContainerComponent
        center={center}
        geolocation={geolocation}
        shows={shows}
        audioRef={audioRef}
        userData={userData}
        currCity={currCity}
        audioLink={audioLink}
        newAudio={newAudio}
        isPlaying={isPlaying}
        setArtist={setArtist}
        setNewAudio={setNewAudio}
        setIsMarkerClicked={setIsMarkerClicked}
        markerRefs={markerRefs}
        markerPlayback={handleMarkerPlayback}
        isMarkerClicked={isMarkerClicked}
      />
      {shows.data.length !== 0 && (
        <DrawerLeft
          shows={shows}
          setCenter={setCenter}
          markerRefs={markerRefs}
          markerPlayback={handleMarkerPlayback}
        />
      )}
      <ControlsBottom
        audioRef={audioRef}
        audioLink={audioLink}
        newAudio={newAudio}
        isPlaying={isPlaying}
        isMarkerClicked={isMarkerClicked}
        isAutoPlay={isAutoPlay}
        setUserData={setUserData}
        handleDateRangeShows={handleDateRangeShows}
        setIsPlaying={setIsPlaying}
        setIsAutoplay={setIsAutoplay}
      />
    </div>
  );
}
