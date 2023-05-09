import { useState } from "react";
import "./ShowMarkers.scss";

import { Marker } from "react-leaflet";
import {
  handleSetArtist,
  handleSetNewAudio,
} from "../../helpers/eventHandlers";

import { ShowData } from "../../datatypes/showData";
import { ShowMarkersProps } from "../../datatypes/props";

import PopUp from "./PopUp";

const ShowMarkers = (props: ShowMarkersProps) => {
  const { shows, setArtist, setNewAudio, audioLink, setIsMarkerClicked } =
    props;
  //                                       was useState<string>("")
  const [lastClickedMarker, setLastClickedMarker] = useState<string | null>(
    null
  );
  
  // currently this is doing nothing
  // const popUpRef = useRef(null);

  const handleMarkerClick = (show: ShowData) => {
    let headliner = "";
    if (show.performer.length === 0) {
      headliner = "";
    } else {
      headliner = show.performer[0].name;
    }
    setIsMarkerClicked(true);
    handleSetArtist(headliner, shows, setArtist);
    setLastClickedMarker(headliner);
    if (headliner !== lastClickedMarker) {
      handleSetNewAudio(setNewAudio, audioLink);
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
            <PopUp
              {...props}
              show={show}
              index={index}
              // ref={popUpRef}
            />
          </Marker>
        ) : null
      )}
    </>
  );
};

export default ShowMarkers;
