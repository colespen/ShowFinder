import { Marker } from "react-leaflet";
import PopUp from "./PopUp";
import { ShowMarkersProps } from "../../datatypes/props";
import { hasVenueCoords } from "../../helpers/utils";

import "./ShowMarkers.scss";

const ShowMarkers = (props: ShowMarkersProps) => {
  const { shows, markerPlayback, markerRefs } = props;

  return (
    <>
      {(shows.data || []).map((show, index) => {
        return hasVenueCoords(show) ? (
          <Marker
            key={show.id}
            position={[
              Number(show.venue.latitude),
              Number(show.venue.longitude),
            ]}
            eventHandlers={{
              click: () => {
                markerPlayback(show);
              },
            }}
            ref={(ref) => (markerRefs.current[index] = ref)}
          >
            <PopUp {...props} show={show} index={index} />
          </Marker>
        ) : null;
      })}
    </>
  );
};

export default ShowMarkers;
