import { useState } from "react";
import { DrawerLeftProps } from "../../datatypes/props";
import { ShowData } from "../../datatypes/showData";
import { artistNameFilter, convertTo12hr } from "../../helpers/utils";
import "./DrawerLeft.scss";

export default function DrawerLeft({ ...props }: DrawerLeftProps) {
  const [startAnimation, setStartAnimation] = useState<boolean>(false);

  return <ShowDrawerList {...props} />;
}

const ShowDrawerList = ({
  shows,
  markerRefs,
  markerPlayback,
  setCenter,
}: DrawerLeftProps) => {

  const openPopupFromList = (
    show: ShowData,
    index: number,
    lat: number,
    lng: number
  ) => {
    console.log(markerRefs.current[index]);
    markerRefs.current[index].openPopup();
    markerPlayback(show);
    setCenter(lat, lng);
  };

  const showListItem = (shows.data || []).map((show, index) => {
    const artistName = artistNameFilter(show);
    const showTime = convertTo12hr(show.startDate);
    let lat = 0;
    let lng = 0;

    if (
      show.location.geo !== undefined &&
      Object.keys(show.location.geo).length > 1
    ) {
      lat = show.location.geo.latitude;
      lng = show.location.geo.longitude;
    }

    return (
      <div
        key={show.description + index}
        className="show-list-item"
        onClick={() => openPopupFromList(show, index, lat, lng)}
      >
        <li>{artistName}</li>
        <ul className="show-list-description">
          <li>{show.location.name}</li>
          <li>{showTime}</li>
        </ul>
      </div>
    );
  });
  return (
    <div className="drawer-left-outer">
      <ul className="drawer-left-container">{showListItem}</ul>
    </div>
  );
};
