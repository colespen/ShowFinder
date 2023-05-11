import {
  handleCityChange,
  handleInputTextSelect,
  handleNewCityOnEnter,
} from "../helpers/eventHandlers";
import { ControlsTopProps } from "../datatypes/props";

import DateRange from "./DateRange";

import "./styles.scss";
import useGeoLocation from "../hooks/useGeoLocation";

const ControlsTop = (props: ControlsTopProps) => {
  const {
    setUserData,
    handleNewCityShows,
    handleDateRangeShows,
    handleCurrLocation,
  } = props;

  const geolocation = useGeoLocation();

  return (
    <div className="controls-top">
      <div className="city-input">
        <input
          type="text"
          name="enter city"
          placeholder="enter city, country"
          autoComplete="off"
          spellCheck="false"
          onChange={(e) => handleCityChange(e, setUserData)}
          onFocus={(e) => handleInputTextSelect(e)}
          onKeyDown={(e) => handleNewCityOnEnter(e, handleNewCityShows)}
        />
        <button onClick={handleNewCityShows}>GO</button>
      </div>

      <div className="date-location" id="date-top">
        <DateRange setUserData={setUserData} />
        <button id="go-button-top" onClick={handleDateRangeShows}>
          GO
        </button>
      </div>
      <button id="current-location" onClick={handleCurrLocation}>
        {geolocation.loaded && <img
          id="location-icon"
          src="./target.png"
          alt="current-location-icon"
        />}
      </button>
    </div>
  );
};

export default ControlsTop;
