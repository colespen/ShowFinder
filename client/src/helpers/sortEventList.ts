import { ShowData } from "../datatypes/showData";
import { UserDataState } from "../datatypes/userData";

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
    // if user coords unavailable, return original  shows
    return shows;
  }

  // calculate distance between two sets of coordinates using the Haversine formula
  function getDistance(
    uLat: number,
    uLng: number,
    evLat: number,
    evLng: number
  ) {
    const R = 6371; // radius of the earth in km
    const dLat = ((evLat - uLat) * Math.PI) / 180;
    const dLng = ((evLng - uLng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((uLat * Math.PI) / 180) *
        Math.cos((evLat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // distance in km
    return d;
  }

  // sort list of shows b distance to user's coordinates
  const sortedShowsData = shows.slice().sort((a, b) => {
    const aLat = a.location.geo?.latitude;
    const aLng = a.location.geo?.longitude;
    const bLat = b.location.geo?.latitude;
    const bLng = b.location.geo?.longitude;
    if (!aLat || !aLng || !bLat || !bLng) {
      return 0;
    }
    const distanceA = getDistance(userLat, userLng, aLat, aLng);
    const distanceB = getDistance(userLat, userLng, bLat, bLng);
    return distanceA - distanceB;
  });

  const indexMap = shows.map((_, index) => {
    return sortedShowsData.findIndex((show) => show === shows[index]);
  });

  return { sortedShowsData, indexMap };
}

export { sortByProximity };
