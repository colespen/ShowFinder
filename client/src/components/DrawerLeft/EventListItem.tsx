import { artistNameFilter, convertTo12hr } from "../../helpers/utils";
import getArtistTickets from "../../helpers/getArtistLinkHandler";
import { EventListItemProps } from "../../datatypes/props";

const EventListItem = ({
  sortedShows,
  openPopupFromList,
}: EventListItemProps) => {
  const EventList = (sortedShows || []).map((show, index) => {
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
            onClick={(e) => {
              e.stopPropagation();
              getArtistTickets(artistName, show.location.name);
            }}
          >
            <img src="./ticket-icon.png" alt="get tickets" />
          </button>
          <a
            id="venue-name"
            href={show.location.sameAs}
            target="_blank"
            rel="noreferrer"
            style={isShowLocationHref}
            onClick={(e) => e.stopPropagation()}
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
  return <>{EventList}</>;
};

export default EventListItem;
