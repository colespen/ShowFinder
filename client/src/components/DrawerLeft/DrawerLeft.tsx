import { useEffect, useState } from "react";

import SlideIn from "./SlideIn";
import ButtonWrapper from "./ButtonWrapper";
import EventsListOuter from "./EventsListOuter";

import { DrawerLeftProps } from "../../datatypes/props";
import "./DrawerLeft.scss";

const DrawerLeft = ({ ...props }: DrawerLeftProps) => {
  const [startAnimation, setStartAnimation] = useState<boolean>(false);
  const [listButton, setListButton] = useState(false);

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
        <EventsListOuter {...props} startAnimation={startAnimation} />
      </SlideIn>
      <ButtonWrapper
        listButton={listButton}
        startAnimation={startAnimation}
        setStartAnimation={setStartAnimation}
      />
    </>
  );
};

export default DrawerLeft;
