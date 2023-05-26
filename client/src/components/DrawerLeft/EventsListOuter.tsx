import { useEffect, useState } from "react";
import EventListItems from "./EventListItems";
import { sortByProximity } from "../../helpers/sortEventList";
import { EventListProps } from "../../datatypes/props";
import { ShowData } from "../../datatypes/showData";
import "./DrawerLeft.scss";

const EventsList = ({
  shows,
  markerRefs,
  markerPlayback,
  setCenter,
  startAnimation,
  userData,
  geolocation,
}: EventListProps) => {
  const [sortedShows, setSortedShows] = useState<ShowData[]>([]);
  const [indexMap, setIndexMap] = useState<number[]>([]);

  const contentsTransitionStyles = startAnimation ? { opacity: "100%" } : {};

  useEffect(() => {
    // let sortedShows = [];
    // Check if the first decimal place of latitude and longitude matches
    if (
      userData.lat &&
      userData.lng &&
      geolocation.coords.lat.toFixed(1) === Number(userData.lat).toFixed(1) &&
      geolocation.coords.lng.toFixed(1) === Number(userData.lng).toFixed(1)
    ) {
      const {
        // sortedShowsData,
        indexMap,
      }: any = sortByProximity(shows.data, userData);
      // sortedShows = sortedShowsData;
      // setSortedShows(sortedShows); // TODO: FIX SORT SO REFS INDEX LINE UP
      setSortedShows(shows.data);
      setIndexMap(indexMap);
    } else {
      const defaultMap = shows.data.map((_, i) => i);
      setSortedShows(shows.data);
      setIndexMap(defaultMap);
    }
  }, [geolocation.coords.lat, geolocation.coords.lng, shows.data, userData]);

  return (
    <div className="drawer-left-outer" 
    style={contentsTransitionStyles}
    >
      <ul className="drawer-left-container">
        <EventListItems
          sortedShows={sortedShows}
          markerPlayback={markerPlayback}
          markerRefs={markerRefs}
          setCenter={setCenter}
          indexMap={indexMap}
        />
      </ul>
    </div>
  );
};

export default EventsList;
