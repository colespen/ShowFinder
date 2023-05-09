import { Marker } from "react-leaflet";
import PopUp from "./PopUp";
import { ShowMarkersProps } from "../../datatypes/props";

import "./ShowMarkers.scss";

const ShowMarkers = (props: ShowMarkersProps) => {
  const { shows, markerPlayback, markerRefs } = props;

  console.log("markerRefs: ", markerRefs)

  return (
    <>
      {(shows.data || []).map((show, index) => {
        console.log("index: ", index)
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
