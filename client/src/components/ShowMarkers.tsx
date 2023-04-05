import { useState, useRef } from "react";
import { Marker, Popup } from "react-leaflet";
import getArtist from "../helpers/artistActions";

// import { Spinner } from "@chakra-ui/spinner";

import "./ShowMarkers.scss";

import { ShowDataState } from "../datatypes/showData";

interface ShowMarkersProps {
  shows: ShowDataState;
  handleSetArtist: (artist: string) => void;
  // audioLink:
  // newAudio:
  // handleSetNewAudio:
  // handlePlayPause:
  // isPlaying:
  setIsMarkerClicked: (state: boolean) => void;
}

const ShowMarkers = (props: ShowMarkersProps) => {
  const {
    shows,
    handleSetArtist,
    // audioLink,
    // newAudio,
    // handleSetNewAudio,
    // handlePlayPause,
    // isPlaying,
    setIsMarkerClicked,
  } = props;
  const [lastClickedMarker, setLastClickedMarker] = useState("");
  const popUpRef = useRef(null);

  function ShowsMapped() {
    return (
      <>
        {(shows.data || []).map((show, index) =>
          show.location.geo ? (
            <Marker
              //TODO: some repeat keys still.. fix in filter in server?
              key={show.description}
              position={[
                show.location.geo.latitude,
                show.location.geo.longitude,
              ]}
              eventHandlers={{
                click: () => {
                  handleSetArtist(show.performer[0].name);
                  setLastClickedMarker(show.performer[0].name);
                  setIsMarkerClicked(true);
                  if (show.performer[0].name !== lastClickedMarker) {
                    // handleSetNewAudio();
                  }
                },
              }}
            >
              <Popup key={index} ref={popUpRef}>
                <ul className="artist-list">
                  {show.performer.map((artist, i) => (
                    <li className="artist" key={`${artist}-${i.toString()}`}>
                      <button onClick={(e) => getArtist(e, show.location.name)}>
                        {artist.name.length > 41
                          ? artist.name.substring(0, 41) + " ..."
                          : artist.name}
                      </button>
                    </li>
                  ))}
                </ul>
                {/* <div className="marker-player-controls">
        {audioLink && newAudio && (
          <button
            className="play-pause media-buttons"
            onClick={handlePlayPause}
          >
            {!isPlaying ? (
              <img src="./play.svg" alt="play-button"></img>
            ) : (
              <img src="./pause.svg" alt="play-button"></img>
            )}
          </button>
        )}
        {!newAudio && <Spinner size="md" />}
        {!audioLink && newAudio && (
          <button className="play-pause media-buttons disabled" disabled>
            <img src="./link-slash.svg" alt="play-button"></img>
          </button>
        )}
      </div> */}
                <a
                  id="venue-name"
                  href={show.location.sameAs}
                  target="_blank"
                  rel="noreferrer"
                >
                  {show.location.name}
                </a>
              </Popup>
            </Marker>
          ) : null
        )}
      </>
    );
  }

  return (
    <>
      <ShowsMapped />
    </>
  );
};

export default ShowMarkers;
