import getArtistTickets, {
  handleXternalMusicLink,
} from "../../helpers/getArtistLinkHandler";
import { Performer, ShowData } from "../../datatypes/showData";

import { artistNameFilter } from "../../helpers/utils";

interface PerformerListProps {
  show: ShowData;
  spotifyUrl: string;
}

const PerformerList = ({ show, spotifyUrl }: PerformerListProps) => {
  const artistName = artistNameFilter(show);
  const ticketUrl = show.ticketUrl;
  const performers = show.performers || [];

  return (
    <>
      {performers.length === 0 ? (
        <li className="artist">
          <button
            className="artist-button"
            onClick={() => getArtistTickets(ticketUrl)}
          >
            <span>{artistName}</span>
            <span className="ticket-span-icon">
              <img src="./ticket-icon.png" alt="get tickets" />
            </span>
          </button>
          <button
            disabled={!spotifyUrl}
            className="music-link"
            onClick={() => handleXternalMusicLink(spotifyUrl)}
          >
            <img src="./spotify-logo.png" alt="external music link" />
          </button>
        </li>
      ) : (
        performers.map((artist: Performer, i: number) => (
          <li className="artist" key={`${artist.name}-${i.toString()}`}>
            <button
              className="artist-button"
              onClick={() => getArtistTickets(ticketUrl)}
            >
              <span>
                {artist.name.length > 30
                  ? artist.name.substring(0, 30) + "..."
                  : artist.name}
              </span>
              {i === 0 && (
                <span className="ticket-span-icon">
                  <img src="./ticket-icon.png" alt="get tickets" />
                </span>
              )}
            </button>

            {i === 0 && (
              <button
                disabled={!spotifyUrl}
                className="music-link"
                onClick={() => handleXternalMusicLink(spotifyUrl)}
              >
                <img src="./spotify-logo.png" alt="external music link" />
              </button>
            )}
          </li>
        ))
      )}
    </>
  );
};

export default PerformerList;
