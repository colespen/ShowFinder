import { useEffect } from "react";
import { Marker } from "react-leaflet";
import PopUp from "./PopUp";
import { ShowMarkersProps } from "../../datatypes/props";

import "./ShowMarkers.scss";

const ShowMarkers = (props: ShowMarkersProps) => {
  const { shows, markerPlayback, markerRefs } = props;

  console.log("in Show Markers")

  useEffect(() => {
    // update markerRefs.current after all markers are rendered
    markerRefs.current = markerRefs.current.filter(Boolean);
  }, [markerRefs, shows]);

  return (
    <>
      {(shows.data || []).map((show, index) => {
        return show.location.geo ? (
          <Marker
            //TODO: some repeat keys still.. fix in filter in server?
            key={show.description}
            position={[show.location.geo.latitude, show.location.geo.longitude]}
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
