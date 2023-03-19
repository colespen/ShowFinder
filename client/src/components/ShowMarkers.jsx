import { Marker, Popup } from 'react-leaflet';
import getArtist from '../helpers/artistActions';
import { useState, useEffect, useRef } from 'react';

const ShowMarkers = ({ shows, handleSetArtist, artist, audioLink }) => {
  // const [audioLoaded, setAudioLoaded] = useState(true);
  const [lastClickedMarker, setLastClickedMarker] = useState(null);
  const [newAudio, setNewAudio] = useState(false);
  const audioRef = useRef(null);
  const popUpRef = useRef(null)

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
    }
  }, [audioLink]);

  // const handleCanPlayThrough = () => {
  //   setAudioLoaded(true);
  // };

  // Only display spinner if new marker (artist)
  const handleSetNewAudio = () => {
    // if (artist !== currArtist[0].innerText) {
      console.log("THRU")
      setNewAudio(true)
    // }
  }

  // change with new artist audio link
  useEffect(() => {
    setNewAudio(false)
  }, [audioLink])

  console.log("lastClickedMarker: ", lastClickedMarker)
  console.log("artist: ", artist)
  console.log("newAudio: ", newAudio);

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
            <div className="player-container">
              {audioLink ?
                <div className="player-container-inner">
                  {newAudio && <div>Spinner...</div>}

                  {!newAudio && (
                    <audio className="audio-player" controls
                      ref={audioRef}
                      // onCanPlayThrough={handleCanPlayThrough}
                    // onLoadedData={handleCanPlay}
                    // onLoadedMetadata={handleCanPlay}
                    // onLoadStart={handleLoadStart}
                    // onCanPlay={handleCanPlay}
                    >
                      <source src={audioLink} type="audio/mpeg" text="dodo" />
                      <code>audio</code> not supported
                    </audio>
                  )}
                </div>
                : <span>audio unavailable</span>
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
