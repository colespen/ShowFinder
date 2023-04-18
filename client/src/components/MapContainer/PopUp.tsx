import { Popup } from "react-leaflet";
import getArtist from "../../helpers/getArtistHandler";
import { PopUpProps } from "../../datatypes/props";
import { Performer } from "../../datatypes/showData";

import MarkerPlayer from "./MarkerPlayer";

const PopUp = (props: PopUpProps) => {
  const { index, show , ...rest} = props;

  return (
    <Popup
      key={index}
      // ref={popUpRef}
    >
      <ul className="artist-list">
        {show.performer.map((artist: Performer, i: number) => (
          <li className="artist" key={`${artist}-${i.toString()}`}>
            <button onClick={(e) => getArtist(e, show.location.name)}>
              {artist.name.length > 41
                ? artist.name.substring(0, 41) + " ..."
                : artist.name}
            </button>
          </li>
        ))}
      </ul>
      <MarkerPlayer
        {...rest}
      />
      <a
        id="venue-name"
        href={show.location.sameAs}
        target="_blank"
        rel="noreferrer"
      >
        {show.location.name}
      </a>
    </Popup>
  );
};

export default PopUp;
