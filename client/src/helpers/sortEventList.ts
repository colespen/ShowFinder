import { ShowData } from "../datatypes/showData";
import { UserDataState } from "../datatypes/userData";
import { hasVenueCoords } from "./utils";

/**
 * returns sorted shows by geographical proximity to user
 */
function sortByProximity(shows: ShowData[], userData: UserDataState) {
  if (shows.length === 0 || !shows) {
    return shows;
  }
  const userLat = Number(userData.lat);
  const userLng = Number(userData.lng);

  if (!userLat || !userLng) {
    return shows;
  }

  function getDistance(
    uLat: number,
    uLng: number,
    evLat: number,
    evLng: number,
  ) {
    const R = 6371;
    const dLat = ((evLat - uLat) * Math.PI) / 180;
    const dLng = ((evLng - uLng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((uLat * Math.PI) / 180) *
        Math.cos((evLat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  const sortedShowsData = shows.slice().sort((a, b) => {
    if (!hasVenueCoords(a) || !hasVenueCoords(b)) {
      return 0;
    }
    const distanceA = getDistance(
      userLat,
      userLng,
      Number(a.venue.latitude),
      Number(a.venue.longitude),
    );
    const distanceB = getDistance(
      userLat,
      userLng,
      Number(b.venue.latitude),
      Number(b.venue.longitude),
    );
    return distanceA - distanceB;
  });

  const indexMap = shows.map((_, index) => {
    return sortedShowsData.findIndex((show) => show === shows[index]);
  });

  return { sortedShowsData, indexMap };
}

export { sortByProximity };
