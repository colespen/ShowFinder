import { useState, useEffect } from 'react';
import Loading from './Loading';
import './styles.scss';


export default function Title(props) {
  const { currCity, transition, isFirstRender, geolocation } = props;
  const [waitOpacity, setWaitOpacity] = useState(0);
  const [showOpacity, setShowOpacity] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [text, setText] = useState("locating shows near you");

  useEffect(() => {
      if (transition.type === "shows") setText("grabbing shows");
      if (transition.type === "dates") setText("grabbing dates");
      if (transition.type === "location") setText("grabbing your location");
  }, [transition]);

  useEffect(() => {
    if (transition.type !== "inital") setWaitOpacity(transition.opacity);

  }, [transition.opacity, transition.type]);


  useEffect(() => {
    if (!geolocation.access) {
      setIsVisible(false);
      setWaitOpacity(0);
      const delayWait = setTimeout(() => {
        if (!currCity) setWaitOpacity(0.65);
      }, 1200);

      
      return () => { clearTimeout(delayWait); };
    }

    if (geolocation.isClick) {
      setIsVisible(false);
      setWaitOpacity(0);
      const delayWait = setTimeout(() => {
        setIsVisible(true);
        setWaitOpacity(0.65);
      }, 2150);
      return () => { clearTimeout(delayWait); };
    };


    if (isFirstRender && geolocation.access && !geolocation.isClick) {
      setIsVisible(true);
      setWaitOpacity(0);
      if (currCity) setWaitOpacity(1);
      const delayWait = setTimeout(() => {
        if (!currCity) {
          setWaitOpacity(0.65);
        }
      }, 450);
      return () => { clearTimeout(delayWait); };
    }

    if (!isFirstRender) {
      if (currCity) setWaitOpacity(0);
      const delayWait = setTimeout(() => {
        setIsVisible(true);
        if (!currCity) setWaitOpacity(0.65);
      }, 300); // 60

      return () => { clearTimeout(delayWait); };
    }

  }, [geolocation.access, geolocation.isClick, currCity, isFirstRender]); // *text?


  useEffect(() => {
    if (currCity) setShowOpacity(0);
    const delayShow = setTimeout(() => {
      if (currCity) setShowOpacity(1);
    }, 550);

    return () => { clearTimeout(delayShow); };
  }, [currCity]);

  return (
    <>
      {!currCity ?
        <div className="wait-container"
          style={{ opacity: waitOpacity }}>
          <h1 className={geolocation.access ?
            "title-wait" : "title-wait pls-allow"}
            id="title-wait">

            {geolocation.access ?
              isVisible ? text : null
              :
              "please allow location acesss"
            }
          </h1>
          {geolocation.access && <Loading />}
        </div>
        :
        <h1
          className={(currCity.length > 17 ?
            "title-show long-entry" : "title-show")
          }
          style={{ opacity: showOpacity }}
        >
          {"shows in " + currCity}
        </h1>
      }
    </>
  );
}