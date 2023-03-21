import DateRange from './DateRange';

import './styles.scss';

const ControlsBottom = ({handleDateSelect, handleDateRangeClick, audioLink, audioRef}) => {
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
      <span>Spencer Cole</span>
    </div>

    {/* <div className="audio-player-bottom">
      <audio controls
        className="audio-player"
        // ref={}
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
    </div> */}

    <div className="date-location" id="date-bottom">
      <DateRange handleDateSelect={handleDateSelect}
      />
      <button id="go-button-bottom"
        onClick={handleDateRangeClick}>GO</button>
    </div>
  </div>
  )
}

export default  ControlsBottom