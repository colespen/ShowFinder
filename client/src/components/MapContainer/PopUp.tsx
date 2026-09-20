import { Popup } from "react-leaflet";
import { PopUpProps } from "../../datatypes/props";

import PerformerList from "./PerformerList";
import MarkerPlayer from "./MarkerPlayer";

const PopUp = (props: PopUpProps) => {
  const { index, show, spotifyUrl, ...rest } = props;

  return (
    <Popup key={index}>
      <ul className="artist-list">
        <PerformerList show={show} spotifyUrl={spotifyUrl} />
      </ul>
      <MarkerPlayer {...rest} />
      <a
        id="venue-name"
        href={show.venue.url || undefined}
        target="_blank"
        rel="noreferrer"
      >
        {show.venue.name}
      </a>
    </Popup>
  );
};

export default PopUp;
