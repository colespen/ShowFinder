import { Marker, Popup } from 'react-leaflet';
import getArtist from '../helpers/artistActions';
import { useState, useEffect, useRef } from 'react';

import { Spinner } from '@chakra-ui/spinner';

const ShowMarkers = ({ shows, handleSetArtist, artist, audioLink }) => {
  const [lastClickedMarker, setLastClickedMarker] = useState(null);
  const [newAudio, setNewAudio] = useState(true);
  const audioRef = useRef(null);
  const popUpRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
    }
  }, [audioLink]);

  // console.log("popUpRef: ", popUpRef.current);

  // Only display spinner if new marker (artist)
  const handleSetNewAudio = () => {
    setNewAudio(false);
    setTimeout(() => {
      if (!audioLink) {
        setNewAudio(true);
      }
    }, 500);
  };
  // render <audio> w new artist audio link
  useEffect(() => {
    setNewAudio(true);
  }, [audioLink]);

  // console.log("lastClickedMarker: ", lastClickedMarker);
  // console.log("artist: ", artist);
  console.log("newAudio: ", newAudio);
  console.log("audioLink: ", audioLink);

  return (
    (shows.data || []).map((show, index) => (
      show.location.geo ?

        <Marker
          //TODO: some repeat keys still.. fix in filter in server?
          key={show.description}
          position={[show.location.geo.latitude, show.location.geo.longitude]}
          eventHandlers={{
            click: () => {
              handleSetArtist(show.performer[0].name);
              setLastClickedMarker(show.performer[0].name);
              if (show.performer[0].name !== lastClickedMarker) {
                console.log("thru eventHandlers");
                handleSetNewAudio();
              }
            }
          }}

        >
          <Popup key={index} id="show-popup" ref={popUpRef}>

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
            <div className="player-container" >
              <div className="player-container-inner" >

                {audioLink && newAudio && (
                  <audio controls
                    className="audio-player"
                    ref={audioRef}
                    preload='metadata'
                  // onCanPlayThrough={handleCanPlayThrough}
                  // onLoadedData={handleCanPlay}
                  // onLoadedMetadata={handleCanPlay}
                  // onLoadStart={handleLoadStart}
                  // onCanPlay={handleCanPlay}
                  >
                    <source src={audioLink} type="audio/mpeg" />
                    <code>audio</code> not supported
                  </audio>
                )}
                {!newAudio && <Spinner size="md" />}
                {!audioLink && newAudio &&
                  <span>audio unavailable</span>
                }
              </div>
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
