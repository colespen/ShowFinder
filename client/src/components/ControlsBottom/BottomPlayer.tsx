import { useState, useEffect } from "react";
import { Spinner } from "@chakra-ui/spinner";
import { handlePlayPause, handleAutoPlay } from "../../helpers/eventHandlers";
import { BottomPlayerProps } from "../../datatypes/props";

const BottomPlayer = (props: BottomPlayerProps) => {
  const {
    audioRef,
    audioLink,
    isMarkerClicked,
    newAudio,
    isPlaying,
    isAutoPlay,
    setIsAutoplay,
    setIsPlaying,
  } = props;

  const [volChange, setVolChange] = useState(0);
  const [windowSize, setWindowSize] = useState(getWindowSize());

  // get and set window with resolution
  useEffect(() => {
    function handleWindowResize() {
      setWindowSize(getWindowSize());
    }
    window.addEventListener("resize", handleWindowResize);

    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, []);

  function getWindowSize() {
    const { innerWidth } = window;
    return { innerWidth };
  }

  // default volume
  useEffect(() => {
    if (audioRef && audioRef.current) {
      audioRef.current.volume = 0.7;
    }
  }, [audioRef]);

  // currently for mute / unmute
  const handleVolChange = () => {
    if (audioRef && audioRef.current) {
      if (!volChange) {
        audioRef.current.volume = 0;
        setVolChange(1);
      } else {
        audioRef.current.volume = 0.7;
        setVolChange(0);
      }
    }
  };

  return (
    <>
      <div className="audio-player-bottom-wrapper">
        <div className="audio-player-inner">
          <audio
            className="audio-player"
            ref={audioRef}
            autoPlay={isAutoPlay}
            preload="metadata"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
          >
            <source src={audioLink} type="audio/mpeg" />
            <code>audio</code> not supported
          </audio>

          {audioLink && isMarkerClicked && (
            <button
              className={`autoplay-bottom ` + isAutoPlay}
              onClick={() => handleAutoPlay(setIsAutoplay)}
            >
              {windowSize.innerWidth > 383
                ? windowSize.innerWidth > 413
                  ? "autoplay"
                  : "auto"
                : ""}
            </button>
          )}
          <div className="buttons-bottom-wrapper">
            {audioLink && newAudio && (
              <>
                <button
                  className="media-buttons play-pause"
                  id="btn-bottom-scale"
                  onClick={() =>
                    handlePlayPause(audioLink, isPlaying, audioRef)
                  }
                >
                  {!isPlaying ? (
                    <img src="./play.svg" alt="play button"></img>
                  ) : (
                    <img src="./pause.svg" alt="pause button"></img>
                  )}
                </button>
                <button
                  className="media-buttons volume"
                  id="btn-bottom-scale"
                  onClick={handleVolChange}
                >
                  {volChange ? (
                    <img src="./volume-mute.svg" alt="mute button"></img>
                  ) : (
                    <img
                      id="vol-on"
                      src="./volume-on.svg"
                      alt="unmute button"
                    ></img>
                  )}
                </button>
              </>
            )}
            {/* audioLink is not great here to prevent Spinner on first render */}
            {!newAudio && audioLink && (
              <div className="spinner-container">
                <Spinner size="sm" />
              </div>
            )}
            {!audioLink && newAudio && isMarkerClicked && (
              <span>
                {windowSize.innerWidth > 350
                  ? windowSize.innerWidth > 410
                    ? "audio unavailable"
                    : "no audio"
                  : ""}
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default BottomPlayer;
