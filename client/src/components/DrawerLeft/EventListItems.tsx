import { handleSetCenter } from "../../helpers/eventHandlers";
import { artistNameFilter, convertTo12hr } from "../../helpers/utils";
import { EventListItemsProps } from "../../datatypes/props";
import { ShowData } from "../../datatypes/showData";
import "./DrawerLeft.scss";
import getArtistTickets from "../../helpers/getArtistLinkHandler";

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
    const isShowGeoStyles = !show.location.geo
      ? {
          border: "2px solid rgb(243, 243, 254)",
          backgroundColor: "rgb(243, 236, 247)",
          color: "#494949",
          cursor: "default",
        }
      : {};
    const isShowLocationHref = !show.location.sameAs
      ? {
          cursor: "default",
        }
      : {};

    return (
      <div
        key={show.description + index}
        className="show-list-item"
        style={isShowGeoStyles}
        onClick={() => openPopupFromList(show, index)}
      >
        <li className="artist-name">{artistName}</li>
        <ul className="show-list-description">
          <button
            className="drawer-ticket-span-icon"
            onClick={() => getArtistTickets(artistName, show.location.name)}
          >
            <img src="./ticket-icon.png" alt="get tickets" />
          </button>
          <a
            id="venue-name"
            href={show.location.sameAs}
            target="_blank"
            rel="noreferrer"
            style={isShowLocationHref}
          >
            <li>
              {show.location.name.length > 29
                ? show.location.name.substring(0, 29) + " ..."
                : show.location.name}
            </li>
          </a>
          <li className="event-time">{showTime}</li>
        </ul>
      </div>
    );
  });
  return <>{eventList}</>;
};

export default EventListItems;
