import { DrawerLeftProps } from "../../datatypes/props";
import { ShowData } from "../../datatypes/showData";
import { artistNameFilter, convertTo12hr } from "../../helpers/utils";
import "./DrawerLeft.scss";

export default function DrawerLeft({ ...props }: DrawerLeftProps) {
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
    markerRefs.current[index].openPopup();
    markerPlayback(show);
    setCenter(lat, lng);
  };

  const showListItem = (shows.data || []).map((show, index) => {
    const artistName = artistNameFilter(show);
    const showTime = convertTo12hr(show.startDate);
    const lat = show.location.geo.latitude;
    const lng = show.location.geo.longitude;

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
