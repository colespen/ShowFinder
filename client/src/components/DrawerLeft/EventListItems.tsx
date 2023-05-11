import { handleSetCenter } from "../../helpers/eventHandlers";
import { artistNameFilter, convertTo12hr } from "../../helpers/utils";
import { EventListItemsProps } from "../../datatypes/props";
import { ShowData } from "../../datatypes/showData";
import "./DrawerLeft.scss";

const EventListItems = ({
  sortedShows,
  markerPlayback,
  markerRefs,
  setCenter,
  indexMap,
}: EventListItemsProps) => {
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
    //   const sortedIndex = indexMap[index];
      markerPlayback(show);
      markerRefs.current[index].openPopup();
      handleSetCenter(showLatLng, setCenter);
    }
  };

  const eventList = (sortedShows || []).map((show, index) => {
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
  return <>{eventList}</>;
};

export default EventListItems;
