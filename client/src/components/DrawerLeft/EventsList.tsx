import { EventListProps } from "../../datatypes/props";
import { ShowData } from "../../datatypes/showData";
import { artistNameFilter, convertTo12hr } from "../../helpers/utils";
import "./DrawerLeft.scss";

const EventsList = ({
  shows,
  markerRefs,
  markerPlayback,
  setCenter,
  startAnimation,
}: EventListProps) => {
  const contentsTransitionStyles = startAnimation
    ? { opacity: "100%", transition: "opacity 1.5s ease" }
    : {};

  const openPopupFromList = (show: ShowData, index: number) => {
    const refLatLng = markerRefs.current[index]._latlng;
    markerRefs.current[index].openPopup();
    markerPlayback(show);
    if (refLatLng && Object.keys(refLatLng).length !== 0) {
      setCenter(refLatLng);
    }
  };

  const showListItem = (shows.data || []).map((show, index) => {
    const artistName = artistNameFilter(show);
    const showTime = convertTo12hr(show.startDate);

    return (
      <div
        key={show.description + index}
        className="show-list-item"
        onClick={() => openPopupFromList(show, index)}
      >
        <li>{artistName}</li>
        <ul className="show-list-description">
          <li>
            {show.location.name.length > 41
              ? show.location.name.substring(0, 31) + " ..."
              : show.location.name}
          </li>
          <li>{showTime}</li>
        </ul>
      </div>
    );
  });
  return (
    <div className="drawer-left-outer" style={contentsTransitionStyles}>
      <ul className="drawer-left-container">{showListItem}</ul>
    </div>
  );
};

export default EventsList;
