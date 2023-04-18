import "./ControlsBottom.scss";

import { ControlsBottomProps } from "../../datatypes/props";

import DateRange from "../DateRange";
import BottomPlayer from "./BottomPlayer";

const ControlsBottom = (props: ControlsBottomProps) => {
  const { setUserData, handleDateRangeShows, ...rest } = props;

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
      <BottomPlayer {...rest} />
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
