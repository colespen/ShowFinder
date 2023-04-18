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
    setIsMarkerClicked(true);
    handleSetArtist(show.performer[0].name, shows, setArtist);
    setLastClickedMarker(show.performer[0].name);
    if (show.performer[0].name !== lastClickedMarker) {
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
