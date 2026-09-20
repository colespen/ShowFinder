import EventListItem from "./EventListItem";
import { handleSetCenter } from "../../helpers/eventHandlers";
import { EventListItemsProps } from "../../datatypes/props";
import { ShowData } from "../../datatypes/showData";
import { hasVenueCoords } from "../../helpers/utils";
import "./DrawerLeft.scss";

const EventListItems = ({
  sortedShows,
  markerPlayback,
  markerRefs,
  setCenter,
}: EventListItemsProps) => {
  const openPopupFromList = (show: ShowData, index: number) => {
    if (!hasVenueCoords(show)) return;
    const showLatLng = {
      lat: Number(show.venue.latitude),
      lng: Number(show.venue.longitude),
    };
    markerPlayback(show);
    markerRefs.current[index]?.openPopup();
    handleSetCenter(showLatLng, setCenter);
  };

  return (
    <EventListItem
      openPopupFromList={openPopupFromList}
      sortedShows={sortedShows}
    />
  );
};

export default EventListItems;
