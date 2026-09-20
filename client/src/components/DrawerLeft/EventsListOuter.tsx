import EventListItems from "./EventListItems";
import { EventListProps } from "../../datatypes/props";
import "./DrawerLeft.scss";

const EventsList = ({
  shows,
  markerRefs,
  markerPlayback,
  setCenter,
  startAnimation,
}: EventListProps) => {
  const contentsTransitionStyles = startAnimation ? { opacity: "100%" } : {};

  const handleTouchMove = (e: React.TouchEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="drawer-left-outer" style={contentsTransitionStyles}>
      <ul className="drawer-left-container" onTouchMove={handleTouchMove}>
        <EventListItems
          sortedShows={shows.data}
          markerPlayback={markerPlayback}
          markerRefs={markerRefs}
          setCenter={setCenter}
        />
      </ul>
    </div>
  );
};

export default EventsList;
