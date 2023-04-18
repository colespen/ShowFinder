import { Dispatch, SetStateAction } from "react";
import { DateRangeType, UserDataState } from "../datatypes/userData";
import { ChangeEvent, FocusEvent, KeyboardEvent } from "../datatypes/events";
import { ShowDataState } from "../datatypes/showData";

////    Set City Name Input
const handleCityChange = (
  e: ChangeEvent,
  setUserData: Dispatch<SetStateAction<UserDataState>>
) => {
  setUserData((prev) => ({ ...prev, newCity: e.target.value }));
};

////   Auto Focus Text in Input
const handleInputTextSelect = (e: FocusEvent) => e.target.select();
// (e.target as HTMLInputElement).select();

////    Submit City on Enter
const handleNewCityOnEnter = (
  e: KeyboardEvent,
  handleNewCityShows: () => void
) => {
  if (e.key === "Enter") handleNewCityShows();
};

////    Set Date Range to State
const handleDateSelect = (
  dateRange: DateRangeType,
  setUserData: Dispatch<SetStateAction<UserDataState>>
) => {
  setUserData((prev) => ({ ...prev, dateRange }));
};

////    Set Artist from marker for audio src (headliner [0])
const handleSetArtist = (
  artist: string,
  shows: ShowDataState,
  setArtist: Dispatch<SetStateAction<string>>
) => {
  // was if (shows) ***
  if (shows.data) setArtist(artist);
};

export {
  handleCityChange,
  handleInputTextSelect,
  handleNewCityOnEnter,
  handleDateSelect,
  handleSetArtist
};
