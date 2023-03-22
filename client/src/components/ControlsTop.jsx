import DateRange from './DateRange';

import './styles.scss';

const ControlsTop = (props) => {
  const {
    handleCityChange,
    handleInputTextSelect,
    newCityOnEnter,
    handleNewCityRequest,
    handleDateSelect,
    handleDateRangeClick,
    handleCurrLocationClick
  } = props;
  
  return (
    <div className="controls-top">
      <div className="city-input">
        <input type="text"
          name="enter city"
          placeholder="enter city, country"
          autoComplete="off"
          spellCheck="false"
          onChange={handleCityChange}
          onFocus={handleInputTextSelect}
          onKeyDown={newCityOnEnter}
        />
        <button onClick={handleNewCityRequest}
        >GO</button>
      </div>

      <div className="date-location" id="date-top">
        <DateRange handleDateSelect={handleDateSelect}
        />
        <button id="go-button-top"
          onClick={handleDateRangeClick}>GO</button>
      </div>
      <button id="current-location"
        onClick={handleCurrLocationClick}
      >
        <img id="location-icon"
          src="./target.png"
          alt="current-location-icon" />
      </button>
    </div>
  );
};

export default ControlsTop;