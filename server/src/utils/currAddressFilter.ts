import type { CurrentAddress } from "../types/api.ts";
import { usStateCode } from "./usStateCode.ts";

/**
 * Builds the city query for the aggregator's geocoder. The qualifier differs by
 * country: US needs the state code ("Austin, TX" works, "Austin, United States"
 * returns nothing), others need the country name. Falls back to the bare city.
 */
export function filterCurrentAddress(currentAddress?: CurrentAddress): string {
  const address: Record<string, string> = currentAddress?.address ?? {};
  const city = address.city ?? "";
  if (!city) return "";

  const countryCode = String(address.country_code ?? "").toLowerCase();
  const state = usStateCode(address.state);
  if (countryCode === "us" && state) return `${city}, ${state}`;
  if (countryCode !== "us" && address.country) return `${city}, ${address.country}`;
  return city;
}


