import { EventListProps } from "../../datatypes/props";
import { ShowData } from "../../datatypes/showData";
import { handleSetCenter } from "../../helpers/eventHandlers";
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
  // console.log("markerRefs.current: ", markerRefs.current);
  // console.log("shows: ", shows);

  const openPopupFromList = (show: ShowData, index: number) => {
    const showLatLng = {
      lat: show.location.geo?.latitude,
      lng: show.location.geo?.longitude,
    };
    // using ref for coords didn't make sense & is buggy
    // const refLatLng = markerRefs.current[index]?._latlng;
    if (
      show.location.geo !== undefined &&
      Object.keys(showLatLng).length !== 0
    ) {
      markerPlayback(show);
      markerRefs.current[index].openPopup();
      handleSetCenter(showLatLng, setCenter)
      // setCenter(showLatLng);
    }
  };
  //   TODO: SORT BY EVENT PROXIMITY (extra: and by time)!

  const showListItem = (shows.data || []).map((show, index) => {
    const artistName = artistNameFilter(show);
    const showTime = convertTo12hr(show.startDate);

    return (
      <div
        key={show.description + index}
        className="show-list-item"
        onClick={() => openPopupFromList(show, index)}
      >
        <li className="artist-name">{artistName}</li>
        <ul className="show-list-description">
          <li>
            {show.location.name.length > 41
              ? show.location.name.substring(0, 31) + " ..."
              : show.location.name}
          </li>
          <li className="event-time">{showTime}</li>
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
