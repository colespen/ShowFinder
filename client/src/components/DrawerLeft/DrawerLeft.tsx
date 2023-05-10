import { useState } from "react";
import SlideIn from "./SlideIn";
import EventsList from "./EventsList";

import { DrawerLeftProps } from "../../datatypes/props";
import "./DrawerLeft.scss";

const DrawerLeft = ({ ...props }: DrawerLeftProps) => {
  const [startAnimation, setStartAnimation] = useState<boolean>(false);

  return (
    <>
      <SlideIn>
        <EventsList {...props} />
        <div className="button-wrapper">
          <button>{">"}</button>
        </div>
      </SlideIn>
    </>
  );
};

export default DrawerLeft;
