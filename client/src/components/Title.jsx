import { Fragment, useState, useEffect } from 'react';
import Loading from './Loading';
import './styles.scss';


export default function Title(props) {
  const { currCity, transition, isFirstRender, geolocation } = props;
  const [opacity, setOpacity] = useState(0);
  const [show, setShow] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [text, setText] = useState("locating shows near you");

  useEffect(() => {
    if (transition.type === "shows") setText("grabbing shows");
    if (transition.type === "dates") setText("grabbing show dates");
    if (transition.type === "location") setText("grabbing your location");

  }, [transition]);

  useEffect(() => {
    if (transition.type !== "inital") setOpacity(transition.opacity);

  }, [transition.opacity, transition.type]);


  useEffect(() => {
    if (!geolocation.access) {
      setIsVisible(false);
      setOpacity(0);
      const delayWait = setTimeout(() => {
        if (!currCity) setOpacity(0.65);
      }, 800);

      
      return () => { clearTimeout(delayWait); };
    }

    if (geolocation.isClick) {
      setIsVisible(false);
      setOpacity(0);
      const delayWait = setTimeout(() => {
        setIsVisible(true);
        setOpacity(0.65);
      }, 2150);
      return () => { clearTimeout(delayWait); };
    };


    if (isFirstRender && geolocation.access && !geolocation.isClick) {
      setIsVisible(true);
      setOpacity(0);
      if (currCity) setOpacity(1);
      const delayWait = setTimeout(() => {
        if (!currCity) {
          setOpacity(0.65);
        }
      }, 450);
      return () => { clearTimeout(delayWait); };
    }

    if (!isFirstRender) {
      setIsVisible(true);
      if (currCity) setOpacity(0);
      const delayWait = setTimeout(() => {
        if (!currCity) setOpacity(0.65);
      }, 60);

      return () => { clearTimeout(delayWait); };
    }

  }, [geolocation.access, geolocation.isClick, currCity, isFirstRender]);


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
          style={{ opacity: opacity }}>
          <h1 className={geolocation.access ?
            "title-wait" : "title-wait pls-allow"}
            id="title-wait">

            {geolocation.access ?
              isVisible ? text : null
              :
              "please allow location acesss"
            }
          </h1>
          {geolocation.access && <Loading className="loading-dots" />}
        </div>
        :
        <h1
          className={(currCity.length > 17 ?
            "title-show long-entry" : "title-show")
          }
          style={{ opacity: show }}
        >
          {"shows in " + currCity}
        </h1>
      }
    </Fragment>
  );
}