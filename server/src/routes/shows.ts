import { Router } from "express";
import type { Response } from "express";

import { forwardGeocode, reverseGeocode } from "../services/locationiq.ts";
import { bareName, emptyPage, searchShowsForCity } from "../services/showSearch.ts";
import type { ApiErrorBody, CurrentAddress, ShowsResponse, NewShowsResponse } from "../types/api.ts";
import type { DateRange } from "../types/show.ts";
import { filterCurrentAddress } from "../utils/currAddressFilter.ts";
import { hasValidCoords, normalizeCurrentAddress } from "../utils/location.ts";
import { withoutAdminPrefix } from "../services/rapidapi.ts";

export const showsRouter = Router();

/** Date range arrives as `dateRange[minDate]=...&dateRange[maxDate]=...`. */
function parseDateRangeQuery(value: unknown): DateRange {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const { minDate, maxDate } = value as Record<string, unknown>;
  return {
    minDate: typeof minDate === "string" ? minDate : undefined,
    maxDate: typeof maxDate === "string" ? maxDate : undefined,
  };
}

showsRouter.get("/api/shows", async (req, res: Response<ShowsResponse | ApiErrorBody>) => {
  const { lat, lng } = req.query;
  if (!hasValidCoords(lat, lng)) {
    res.status(400).json({
      error: "Valid lat and lng are required (got 0,0 or missing GPS)",
    });
    return;
  }

  const currentAddress = await reverseGeocode(lat, lng);
  const address = currentAddress.address ?? {};
  // Order matters: the first non-empty result wins, and a borough-qualified name
  // returns wrong shows rather than failing ("City of Westminster" -> Sydney),
  // so the prefix-stripped "Westminster" is tried first.
  const { data, page, locationName } = await searchShowsForCity(
    [
      withoutAdminPrefix(address.city),
      filterCurrentAddress(currentAddress),
      address.city,
      address.state,
    ],
    parseDateRangeQuery(req.query.dateRange),
    { lat, lng },
  );

  const displayAddress: CurrentAddress = {
    ...currentAddress,
    address: { ...address, city: bareName(locationName) || address.city || "" },
  };

  res.json({ data, currentAddress: displayAddress, page });
});

showsRouter.get("/api/newshows", async (req, res: Response<NewShowsResponse | ApiErrorBody>) => {
  const newCity = typeof req.query.newCity === "string" ? req.query.newCity : "";
  if (!newCity) {
    res.status(400).json({ error: "newCity is required" });
    return;
  }

  const latLng = await forwardGeocode(newCity);
  if (!latLng.length) {
    res.json({ data: [], latLng: [], page: emptyPage(50) });
    return;
  }

  // Widen from "City, Country"/"City, ST" to the bare/typed city.
  const address = normalizeCurrentAddress(latLng[0] as CurrentAddress).address ?? {};
  const first = latLng[0];
  const { data, page, locationName } = await searchShowsForCity(
    [filterCurrentAddress({ address }), address.city, address.state, newCity],
    parseDateRangeQuery(req.query.dateRange),
    { lat: first.lat, lng: first.lon },
  );

  const displayAddress: CurrentAddress = {
    address: { ...address, city: bareName(locationName) || address.city || newCity },
  };

  res.json({ data, latLng, page, currentAddress: displayAddress });
});
