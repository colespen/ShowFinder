import { Marker } from "react-leaflet";
import PopUp from "./PopUp";
import { ShowMarkersProps } from "../../datatypes/props";
import { hasVenueCoords } from "../../helpers/utils";

import "./ShowMarkers.scss";

const ShowMarkers = (props: ShowMarkersProps) => {
  const { shows, markerPlayback, markerRefs } = props;

  return (
    <>
      {(shows.data || []).map((show) => {
        if (!hasVenueCoords(show)) return null;

        // Keyed by show id, not index: coord-less shows are skipped here but
        // still listed in the drawer, so positional refs would drift.
        return (
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
            ref={(ref) => {
              if (ref) markerRefs.current[show.id] = ref;
            }}
          >
            <PopUp {...props} show={show} />
          </Marker>
        );
      })}
    </>
  );
};

export default ShowMarkers;
