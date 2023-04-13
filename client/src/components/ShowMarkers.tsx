import { useState } from "react";
import { Marker, Popup } from "react-leaflet";
import getArtist from "../helpers/artistActions";
import { ShowData } from "../datatypes/showData";
import { ShowDataState } from "../datatypes/showData";

import MarkerPlayer from "./MarkerPlayer";

import "./ShowMarkers.scss";

interface ShowMarkersProps {
  shows: ShowDataState;
  handleSetArtist: (artist: string) => void;
  audioLink: string;
  newAudio: boolean;
  handleSetNewAudio: () => void;
  handlePlayPause: () => void;
  isPlaying: boolean;
  setIsMarkerClicked: (state: boolean) => void;
}

const ShowMarkers = (props: ShowMarkersProps) => {
  const {
    shows,
    handleSetArtist,
    audioLink,
    newAudio,
    handleSetNewAudio,
    handlePlayPause,
    isPlaying,
    setIsMarkerClicked,
  } = props;

  //                                       was useState<string>("")
  const [lastClickedMarker, setLastClickedMarker] = useState<string | null>(
    null
  );

  // currently this is doing nothing
  // const popUpRef = useRef(null);

  const handleMarkerClick = (show: ShowData) => {
    setIsMarkerClicked(true);
    handleSetArtist(show.performer[0].name);
    setLastClickedMarker(show.performer[0].name);
    if (show.performer[0].name !== lastClickedMarker) {
      handleSetNewAudio();
    }
  };

  return (
    <>
      {(shows.data || []).map((show, index) =>
        show.location.geo ? (
          <Marker
            //TODO: some repeat keys still.. fix in filter in server?
            key={show.description}
            position={[show.location.geo.latitude, show.location.geo.longitude]}
            eventHandlers={{
              click: () => {
                handleMarkerClick(show);
              },
            }}
          >
            <Popup
              key={index}
              // ref={popUpRef}
            >
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
              <MarkerPlayer
                audioLink={audioLink}
                newAudio={newAudio}
                handlePlayPause={handlePlayPause}
                isPlaying={isPlaying}
              />
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
};

export default ShowMarkers;
