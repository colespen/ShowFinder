import { useEffect, useState } from "react";
import SlideIn from "./SlideIn";
import EventsList from "./EventsList";

import { DrawerLeftProps } from "../../datatypes/props";
import "./DrawerLeft.scss";

const DrawerLeft = ({ ...props }: DrawerLeftProps) => {
  const [startAnimation, setStartAnimation] = useState<boolean>(false);
  const [listButton, setListButton] = useState(false);
  const openTransitionStyles = startAnimation ? { opacity: "0" } : {};
  const closeTransitionStyles = !startAnimation ? { opacity: "0" } : {};

  useEffect(() => {
    const delayIcon = setTimeout(() => {
      if (startAnimation) setListButton(true);
      else setListButton(false);
    }, 750);
    return () => clearTimeout(delayIcon);
  }, [listButton, startAnimation]);

  return (
    <>
      <SlideIn startAnimation={startAnimation}>
        <EventsList {...props} startAnimation={startAnimation} />
        <div className="button-wrapper">
          <button onClick={() => setStartAnimation(!startAnimation)}>
            {listButton ? (
              <img
                style={closeTransitionStyles}
                className="close-drawer-icon"
                src="./close-arrow.png"
                alt="events list close"
              ></img>
            ) : (
              <img
                style={openTransitionStyles}
                className="drawer-button-icon"
                id="close-drawer"
                src="./list-icon.png"
                alt="events list open"
              ></img>
            )}
          </button>
        </div>
      </SlideIn>
    </>
  );
};

export default DrawerLeft;
