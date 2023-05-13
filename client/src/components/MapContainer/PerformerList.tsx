import getArtist, {
  handleXternalMusicLink,
} from "../../helpers/getArtistHandler";
import { Performer, ShowData } from "../../datatypes/showData";

import { artistNameFilter } from "../../helpers/utils";

interface PerformerListProps {
  show: ShowData;
  spotifyUrl: string;
}

const PerformerList = ({ show, spotifyUrl }: PerformerListProps) => {
  const artistName = artistNameFilter(show);

  const ArtistList = ({ show, spotifyUrl }: PerformerListProps) => {
    if (show.performer.length === 0) {
      return (
        <li className="artist">
          <button
            className="artist-button"
            onClick={(e) => getArtist(e, show.location.name)}
          >
            <span>{artistName}</span>
            <span>
              <img src="./ticket-icon.png" alt="get tickets" />
            </span>
          </button>
          <button
            className="music-link"
            onClick={() => handleXternalMusicLink(spotifyUrl)}
          >
            <img src="./spotify-logo.png" alt="external music link" />
          </button>
        </li>
      );
    } else {
      return (
        <>
          {show.performer.map((artist: Performer, i: number) => (
            <li className="artist" key={`${artist.name}-${i.toString()}`}>
              <button
                className="artist-button"
                onClick={(e) => getArtist(e, show.location.name)}
              >
                <span>
                  {artist.name.length > 41
                    ? artist.name.substring(0, 41) + " ..."
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
                  className="music-link"
                  onClick={() => handleXternalMusicLink(spotifyUrl)}
                >
                  <img src="./spotify-logo.png" alt="external music link" />
                </button>
              )}
            </li>
          ))}
        </>
      );
    }
  };

  return <ArtistList show={show} spotifyUrl={spotifyUrl} />;
};

export default PerformerList;
