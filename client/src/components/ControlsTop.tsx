// import DateRange from "./DateRange";
import { UserDataState, DateRangeType } from "../datatypes/userData";
import { SetStateAction } from "react";
import { KeyboardEvent, ChangeEvent, FocusEvent } from "../datatypes/events";

import "./styles.scss";

interface ControlsTopProps {
  setUserData: (value: SetStateAction<UserDataState>) => void;
  handleCityChange: (e: ChangeEvent) => void;
  handleInputTextSelect: (e: FocusEvent) => void;
  handleNewCityOnEnter: (e: KeyboardEvent) => void;
  handleNewCityShows: () => void;
  handleDateSelect: (dateRange: DateRangeType) => void;
  handleDateRangeShows: () => void;
  handleCurrLocation: () => void;
}

const ControlsTop = (props: ControlsTopProps) => {
  const {
    setUserData,
    handleCityChange,
    handleInputTextSelect,
    handleNewCityOnEnter,
    handleNewCityShows,
    handleDateSelect,
    handleDateRangeShows,
    handleCurrLocation,
  } = props;

  return (
    <div className="controls-top">
      <div className="city-input">
        <input
          type="text"
          name="enter city"
          placeholder="enter city, country"
          autoComplete="off"
          spellCheck="false"
          onChange={handleCityChange}
          onFocus={handleInputTextSelect}
          onKeyDown={handleNewCityOnEnter}
        />
        <button onClick={handleNewCityShows}>GO</button>
      </div>

      <div className="date-location" id="date-top">
        {/* <DateRange
          setUserData={setUserData}
          handleDateSelect={handleDateSelect}
        /> */}
        <button id="go-button-top" onClick={handleDateRangeShows}>
          GO
        </button>
      </div>
      <button id="current-location" onClick={handleCurrLocation}>
        <img
          id="location-icon"
          src="./target.png"
          alt="current-location-icon"
        />
      </button>
    </div>
  );
};

export default ControlsTop;
