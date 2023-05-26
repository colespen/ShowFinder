import EventListItem from "./EventListItem";
import { handleSetCenter } from "../../helpers/eventHandlers";
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

  return (
    <EventListItem
      openPopupFromList={openPopupFromList}
      sortedShows={sortedShows}
    />
  );
};

export default EventListItems;
