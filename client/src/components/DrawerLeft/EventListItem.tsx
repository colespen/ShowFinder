import { artistNameFilter, convertTo12hr, hasVenueCoords } from "../../helpers/utils";
import getArtistTickets from "../../helpers/getArtistLinkHandler";
import { EventListItemProps } from "../../datatypes/props";

const EventListItem = ({
  sortedShows,
  openPopupFromList,
}: EventListItemProps) => {
  const EventList = (sortedShows || []).map((show, index) => {
    const artistName = artistNameFilter(show);
    const showTime = convertTo12hr(show.startDate);
    const isShowGeoStyles = !hasVenueCoords(show)
      ? {
          border: "2px solid rgb(243, 243, 254)",
          backgroundColor: "rgb(243, 236, 247)",
          color: "#494949",
          cursor: "default",
        }
      : {};
    const isShowLocationHref = !show.venue.url
      ? {
          cursor: "default",
        }
      : {};
    const venueName = show.venue?.name || "";

    return (
      <div
        key={show.id || `${venueName}-${index}`}
        className="show-list-item"
        style={isShowGeoStyles}
        onClick={() => openPopupFromList(show)}
      >
        <li className="artist-name">{artistName}</li>
        <ul className="show-list-description">
          <button
            className="drawer-ticket-span-icon"
            onClick={(e) => {
              e.stopPropagation();
              getArtistTickets(show.ticketUrl);
            }}
          >
            <img src="./ticket-icon.png" alt="get tickets" />
          </button>
          <a
            id="venue-name"
            href={show.venue.url || undefined}
            target="_blank"
            rel="noreferrer"
            style={isShowLocationHref}
            onClick={(e) => e.stopPropagation()}
          >
            <li>
              {venueName.length > 29
                ? venueName.substring(0, 29) + " ..."
                : venueName}
            </li>
          </a>
          <li className="event-time">{showTime}</li>
        </ul>
      </div>
    );
  });
  return <>{EventList}</>;
};

export default EventListItem;
