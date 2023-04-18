import { Dispatch, SetStateAction } from "react";
import { UserDataState } from "../datatypes/userData";
import { ChangeEvent, FocusEvent, KeyboardEvent } from "../datatypes/events";

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

export { handleCityChange, handleInputTextSelect, handleNewCityOnEnter };
