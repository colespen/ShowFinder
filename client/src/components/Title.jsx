import { Fragment, useState, useEffect } from 'react';
import Loading from './Loading';
import './styles.scss';


export default function Title({ currCity, newCity }) {
  const [wait, setWait] = useState(0);
  const [show, setShow] = useState(0);

  useEffect(() => {
    const delayWait = setTimeout(() => {
      if (!currCity) setWait(0.60);
    }, 100);
    return () => {clearTimeout(delayWait)};
  }, [currCity]);

  useEffect(() => {
    const delayShow = setTimeout(() => {
      if (currCity) {
        setShow(1);
      }
    }, 500);
    return () => {clearTimeout(delayShow)};
  }, [currCity, newCity]);


  return (
    <Fragment>
      {!currCity ?
        <div className="wait-container" 
          style={{ opacity: wait }}>
          <h1 className="title-wait" id="title-wait"
          >
            locating shows near you
          </h1>
          <Loading className="loading-dots" />
        </div>
        :
        <h1 className="title-show" style={{opacity: show}}
        >
          {"shows in " + currCity}
        </h1>
      }
    </Fragment>
  );
}