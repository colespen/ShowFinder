import { useState, useEffect } from 'react';
import DateRange from './DateRange';
import { Spinner } from '@chakra-ui/spinner';

import './styles.scss';

const ControlsBottom = (props) => {
  const {
    setUserData,
    handleDateSelect,
    handleDateRangeClick,
    audioLink,
    audioRef,
    newAudio,
    handlePlayPause,
    setIsPlaying,
    isPlaying,
    isMarkerClicked
  } = props;

  const [volChange, setVolChange] = useState(0);
  const [isAutoPlay, setIsAutoplay] = useState(true);
  const [windowSize, setWindowSize] = useState(getWindowSize());

  // get and set window with resolution
  useEffect(() => {
    function handleWindowResize() {
      setWindowSize(getWindowSize());
    }

    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);
  function getWindowSize() {
    const { innerWidth } = window;
    return { innerWidth };
  }

  // default volume
  useEffect(() => {
    audioRef.current.volume = 0.7;
  }, [audioRef]);

  // currently for mute / unmute
  const handleVolChange = () => {
    if (!volChange) {
      audioRef.current.volume = 0;
      setVolChange(1);
    } else {
      audioRef.current.volume = 0.7;
      setVolChange(0);
    }
  };

  const handleAutoPlay = () => {
    setIsAutoplay(prev => !prev);
  };

  return (
    <div className="controls-bottom">
      <div className="github">
        <a href="https://github.com/colespen/ShowFinder"
          target="_blank"
          rel="noreferrer"
        >
          <img src="./github-mark.svg" width="18" height="18"
            alt="GitHub-link"></img>
        </a>
        <span id="author-hover">Spencer Cole</span>
      </div>

      <div className="audio-player-bottom-wrapper" >
        <div className="audio-player-inner" >

          <audio
            className="audio-player"
            ref={audioRef}
            autoPlay={isAutoPlay}
            preload='metadata'
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
          >
            <source src={audioLink} type="audio/mpeg" />
            <code>audio</code> not supported
          </audio>


          {audioLink && isMarkerClicked &&
            <button className={`autoplay-bottom ` + isAutoPlay}
              onClick={handleAutoPlay}
            >
              {windowSize.innerWidth > 383 ?
                windowSize.innerWidth > 413 ? "autoplay" : "auto"
                :
                ""
              }
            </button>
          }
          <div className="buttons-bottom-wrapper">
            {audioLink && newAudio && (
              <>
                <button className="media-buttons play-pause" id="btn-bottom-scale"
                  onClick={handlePlayPause}
                >
                  {!isPlaying ?
                    <img src="./play.svg" alt="play-button"></img> :
                    <img src="./pause.svg" alt="play-button"></img>
                  }
                </button>
                <button className="media-buttons volume" id="btn-bottom-scale"
                  onClick={handleVolChange}
                >
                  {volChange ?
                    <img src="./volume-mute.svg" alt="play-button"></img> :
                    <img id="vol-on" src="./volume-on.svg" alt="play-button"></img>
                  }
                </button>
              </>
            )}
            {!newAudio &&
              <div className="spinner-container">
                <Spinner size="sm" />
              </div>
            }
            {!audioLink && newAudio && isMarkerClicked &&
              <span>
                {windowSize.innerWidth > 350 ?
                  windowSize.innerWidth > 410 ? "audio unavailable" : "no audio"
                  :
                  ""
                }
              </span>
            }
          </div>
        </div>
      </div>

      <div className="date-location" id="date-bottom">
        <DateRange
          setUserData={setUserData}
          handleDateSelect={handleDateSelect}
        />
        <button id="go-button-bottom"
          onClick={handleDateRangeClick}>GO</button>
      </div>
    </div>
  );
};

export default ControlsBottom;