import { Marker, Popup } from 'react-leaflet';
import getArtist from '../helpers/artistActions';

const ShowMarkers = ({ shows }) => {

  return (
    (shows.data || []).map((show, index) => (
      show.location.geo ?

        <Marker
          key={show.description}
          position={[show.location.geo.latitude, show.location.geo.longitude]}
        >
          <Popup key={index} id="show-popup">

            <ul className="artist-list" href="">
              {show.performer.map((artist, i) =>
              (
                <li className="artist" key={artist + i}>
                  <button onClick={getArtist}>
                    {artist.name}
                  </button>
                </li>
              ))}
            </ul>
            <a id="venue-name"
              href={show.location.sameAs}
              target="_blank"
              rel="noreferrer">
              {show.location.name}
            </a>
          </Popup>
        </Marker>
        :
        null
    ))
  );
};

export default ShowMarkers
