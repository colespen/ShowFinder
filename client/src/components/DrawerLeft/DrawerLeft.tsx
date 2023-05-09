import { ShowDataState } from "../../datatypes/showData";
import { artistNameFilter, convertTo12hr } from "../../helpers/utils";
import "./DrawerLeft.scss";
interface DrawerLeftProps {
  shows: ShowDataState;
}

const DrawerLeft = ({ shows }: DrawerLeftProps) => {
  return (
    // <div className="drawer-left-outer">
    <ShowDrawerList shows={shows} />
    // </div>
  );
};

const ShowDrawerList = ({ shows }: DrawerLeftProps) => {
  const showListItem = (shows.data || []).map((show, i) => {
    const artistName = artistNameFilter(show)
    const showTime = convertTo12hr(show.startDate);

    return (
      <div key={show.description + i} className="show-list-item">
        <li>{artistName}</li>
        <ul className="show-list-description">
          <li>{show.location.name}</li>
          <li>{showTime}</li>
        </ul>
      </div>
    );
  });
  return <ul className="drawer-left-container">{showListItem}</ul>;
};

export default DrawerLeft;
