import { Marker, Popup } from 'react-leaflet';
import getArtist from '../helpers/artistActions';

const ShowMarkers = ({ shows }) => {

  return (
    (shows.data || []).map((show, index) => (
      show.location.geo ?

        <Marker
        //TODO: some repeat keys still.. fix in filter in server?
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
            <div>
              <audio controls>
                <source src={`https://p.scdn.co/mp3-preview/d95978e0b4948c22fb175b39e9436537525c9aeb?cid=76674eb40ff44fc5bf0b290de0cad21c`} type="audio/mpeg" />
              </audio>
            </div>
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

export default ShowMarkers;
