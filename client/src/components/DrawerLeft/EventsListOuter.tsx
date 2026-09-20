import { useEffect, useState } from "react";
import EventListItems from "./EventListItems";
import { EventListProps } from "../../datatypes/props";
import { ShowData } from "../../datatypes/showData";
import "./DrawerLeft.scss";

const EventsList = ({
  shows,
  markerRefs,
  markerPlayback,
  setCenter,
  startAnimation,
}: EventListProps) => {
  const [sortedShows, setSortedShows] = useState<ShowData[]>([]);

  const contentsTransitionStyles = startAnimation ? { opacity: "100%" } : {};

  useEffect(() => {
    // Proximity sorting is intentionally not applied to the rendered list:
    // reordering the rows without remapping markerRefs would desync which
    // marker a row opens (see sortByProximity's indexMap). Rows stay in the
    // order returned by the server, which the markers match 1:1.
    setSortedShows(shows.data);
  }, [shows.data]);

  const handleTouchMove = (e: React.TouchEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="drawer-left-outer" style={contentsTransitionStyles}>
      <ul className="drawer-left-container" onTouchMove={handleTouchMove}>
        <EventListItems
          sortedShows={sortedShows}
          markerPlayback={markerPlayback}
          markerRefs={markerRefs}
          setCenter={setCenter}
        />
      </ul>
    </div>
  );
};

export default EventsList;
