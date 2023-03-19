import { Marker, Popup } from 'react-leaflet';
import getArtist from '../helpers/artistActions';
import {useEffect, useRef} from 'react';

const ShowMarkers = ({ shows, handleSetArtist, audioLink }) => {

  // console.log("audioLink ShowMarkers: ", audioLink);

  const audioRef = useRef(null)

  console.log("audioRef", audioRef)

  useEffect(() => {
    if(audioRef.current) {
      audioRef.current.load()
    }
  }, [audioLink])

  return (
    (shows.data || []).map((show, index) => (
      show.location.geo ?

        <Marker
        //TODO: some repeat keys still.. fix in filter in server?
          key={show.description}
          position={[show.location.geo.latitude, show.location.geo.longitude]}
          eventHandlers={{ click: () => handleSetArtist(show.performer[0].name) }} 
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
              {audioLink ? 
              <audio ref={audioRef} controls>
                <source src={audioLink} type="audio/mpeg" text="dodo" />
                <code>audio</code> not supported
              </audio> 
              : "audio preview unavailable"
            }
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
