import "./ControlsBottom.scss";

import { ControlsBottomProps } from "../../datatypes/props";

import DateRange from "../DateRange";
import BottomPlayer from "./BottomPlayer";

const ControlsBottom = (props: ControlsBottomProps) => {
  const {
    setUserData,
    handleDateRangeShows,
    audioLink,
    audioRef,
    newAudio,
    handlePlayPause,
    setIsPlaying,
    isPlaying,
    isMarkerClicked,
    handleAutoPlay,
    isAutoPlay,
  } = props;

  return (
    <div className="controls-bottom">
      <div className="github">
        <a
          href="https://github.com/colespen/ShowFinder"
          target="_blank"
          rel="noreferrer"
        >
          <img
            src="./github-mark.svg"
            width="18"
            height="18"
            alt="GitHub-link"
          ></img>
        </a>
        <span id="author-hover">Spencer Cole</span>
      </div>
      <BottomPlayer
        audioRef={audioRef}
        audioLink={audioLink}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        isMarkerClicked={isMarkerClicked}
        newAudio={newAudio}
        isPlaying={isPlaying}
        handlePlayPause={handlePlayPause}
        handleAutoPlay={handleAutoPlay}
        isAutoPlay={isAutoPlay}
      />
      <div className="date-location" id="date-bottom">
        <DateRange setUserData={setUserData} />
        <button id="go-button-bottom" onClick={handleDateRangeShows}>
          GO
        </button>
      </div>
    </div>
  );
};

export default ControlsBottom;
