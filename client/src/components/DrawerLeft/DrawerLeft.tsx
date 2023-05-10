import { useState } from "react";
import SlideIn from "./SlideIn";
import EventsList from "./EventsList";

import { DrawerLeftProps } from "../../datatypes/props";
import "./DrawerLeft.scss";

const DrawerLeft = ({ ...props }: DrawerLeftProps) => {
  const [startAnimation, setStartAnimation] = useState<boolean>(false);
  const buttonTransitionStyles = startAnimation
    ? {
        filter: "invert(5%)",
        "&:hover": {
          backgroundColor: "rgb(255, 255, 255)",
        },
      }
    : {};

  return (
    <>
      <SlideIn startAnimation={startAnimation}>
        <EventsList {...props} startAnimation={startAnimation} />
        <div className="button-wrapper">
          <button onClick={() => setStartAnimation(!startAnimation)}>
            <img
              style={buttonTransitionStyles}
              className="drawer-button-icon"
              src="./list-icon.png"
              alt="events list"
            ></img>
          </button>
        </div>
      </SlideIn>
    </>
  );
};

export default DrawerLeft;
