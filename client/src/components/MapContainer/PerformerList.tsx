import getArtist from "../../helpers/getArtistHandler";
import { Performer, ShowData } from "../../datatypes/showData";

import { artistNameFilter } from "../../helpers/utils";

interface PerformerListProps {
  show: ShowData;
}

const PerformerList = ({ show }: PerformerListProps) => {
    const artistName = artistNameFilter(show);
  
    if (show.performer.length === 0) {
      return (
        <li className="artist">
          <button onClick={(e) => getArtist(e, show.location.name)}>
            {artistName}
          </button>
        </li>
      );
    } else {
      return (
        <>
          {show.performer.map((artist: Performer, i: number) => (
            <li className="artist" key={`${artist.name}-${i.toString()}`}>
              <button onClick={(e) => getArtist(e, show.location.name)}>
                {artist.name.length > 41
                  ? artist.name.substring(0, 41) + " ..."
                  : artist.name}
              </button>
            </li>
          ))}
        </>
      );
    }
  };

  export default PerformerList