import { useState } from "react";
import SlideIn from "./SlideIn";
import EventsList from "./EventsList";

import { DrawerLeftProps } from "../../datatypes/props";
import "./DrawerLeft.scss";

const DrawerLeft = ({ ...props }: DrawerLeftProps) => {
  const [startAnimation, setStartAnimation] = useState<boolean>(false);

  return (
    <>
      <SlideIn startAnimation={startAnimation}>
        <EventsList {...props} startAnimation={startAnimation}/>
        <div className="button-wrapper">
          <button onClick={() => setStartAnimation(!startAnimation)}>
            {">"}
          </button>
        </div>
      </SlideIn>
    </>
  );
};

export default DrawerLeft;
