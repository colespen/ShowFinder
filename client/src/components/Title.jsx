import { Fragment, useState, useEffect } from 'react';
import Loading from './Loading';
import './styles.scss';


export default function Title(props) {
  const { currCity, transition, isFirstRender } = props;
  const [wait, setWait] = useState(0);
  const [show, setShow] = useState(0);
  const [text, setText] = useState("locating shows near you");

  useEffect(() => {
    if (transition.type === "shows") setText("grabbing shows")
    if (transition.type === "dates") setText("grabbing show dates");
    if (transition.type === "location") setText("grabbing your location");

  }, [transition.type]);

  useEffect(() => {
    if (transition.isTrue !== "inital") setWait(transition.opacity);

  }, [transition.opacity, transition.isTrue]);

  useEffect(() => {
    if (isFirstRender) {
      setWait(0);
      if (currCity) setWait(0);
      const delayWait = setTimeout(() => {
        if (!currCity) setWait(0.55);
      }, 350);
      return () => { clearTimeout(delayWait); };
    }
  }, [currCity]);

  useEffect(() => {
    if (!isFirstRender) {
      if (currCity) setWait(0);
      const delayWait = setTimeout(() => {
        if (!currCity) setWait(0.55);
      }, 60);
  
      return () => { clearTimeout(delayWait); };
    }
  }, [currCity]);


  useEffect(() => {
    if (currCity) setShow(0);
    const delayShow = setTimeout(() => {
      if (currCity) setShow(1);
    }, 550);

    return () => { clearTimeout(delayShow); };
  }, [currCity]);


  return (
    <Fragment>
      {!currCity ?
        <div className="wait-container"
          style={{ opacity: wait }}>
          <h1 className="title-wait" id="title-wait">
            {text}
          </h1>
          <Loading className="loading-dots" />
        </div>
        :
        <h1 className="title-show"
          style={{ opacity: show }}
        >
          {"shows in " + currCity}
        </h1>
      }
    </Fragment>
  );
}