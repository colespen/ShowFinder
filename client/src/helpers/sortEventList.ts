import { ShowData } from "../datatypes/showData";
import { UserDataState } from "../datatypes/userData";
import { hasVenueCoords } from "./utils";

/**
 * Sort shows by distance from the user (Haversine, km).
 *
 * Applied once in Map.tsx so markers and drawer rows share one order. Shows
 * without venue coords sort last (they are listed but have no marker).
 *
 * Returns the input unchanged when user coords are unknown.
 */
function sortByProximity(shows: ShowData[], userData: UserDataState) {
  if (!Array.isArray(shows) || shows.length === 0) {
    return shows;
  }

  const userLat = Number(userData.lat);
  const userLng = Number(userData.lng);
  if (!Number.isFinite(userLat) || !Number.isFinite(userLng)) {
    return shows;
  }

  const getDistance = (evLat: number, evLng: number) => {
    const R = 6371;
    const dLat = ((evLat - userLat) * Math.PI) / 180;
    const dLng = ((evLng - userLng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((userLat * Math.PI) / 180) *
        Math.cos((evLat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  return shows.slice().sort((a, b) => {
    const aHas = hasVenueCoords(a);
    const bHas = hasVenueCoords(b);
    // Coord-less shows keep relative order, after located ones.
    if (!aHas && !bHas) return 0;
    if (!aHas) return 1;
    if (!bHas) return -1;
    const distanceA = getDistance(Number(a.venue.latitude), Number(a.venue.longitude));
    const distanceB = getDistance(Number(b.venue.latitude), Number(b.venue.longitude));
    return distanceA - distanceB;
  });
}

export { sortByProximity };
