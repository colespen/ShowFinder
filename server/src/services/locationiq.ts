import axios from "axios";
import type { AxiosResponse } from "axios";

import { env } from "../config/env.ts";
import type { CurrentAddress, GeoSearchResult } from "../types/api.ts";
import { normalizeCurrentAddress } from "../utils/location.ts";

/** Retries LocationIQ's per-second 429s; other errors and 404s propagate. */
async function getWithRateLimitRetry(
  url: string,
  retries = 3,
): Promise<AxiosResponse<unknown>> {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await axios.get(url);
    } catch (error) {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      if (!(status === 429 && attempt < retries)) throw error;
      await new Promise((resolve) => setTimeout(resolve, 600 * (attempt + 1)));
    }
  }
}

export async function reverseGeocode(lat: unknown, lng: unknown): Promise<CurrentAddress> {
  const params = new URLSearchParams({
    key: env.locationIqToken ?? "",
    lat: String(lat),
    lon: String(lng),
    format: "json",
    zoom: "10",
    normalizecity: "1",
    normalizeaddress: "1",
    addressdetails: "1",
  });

  const response = await getWithRateLimitRetry(
    `https://us1.locationiq.com/v1/reverse?${params.toString()}`,
  );
  return normalizeCurrentAddress(response.data as CurrentAddress);
}

export async function forwardGeocode(city: string): Promise<GeoSearchResult[]> {
  const params = new URLSearchParams({
    key: env.locationIqToken ?? "",
    city,
    format: "json",
    addressdetails: "1",
  });

  try {
    const response = await getWithRateLimitRetry(
      `https://us1.locationiq.com/v1/search?${params.toString()}`,
    );
    const results = Array.isArray(response.data)
      ? (response.data as GeoSearchResult[])
      : [];
    return [...results].sort(
      (a, b) => parseFloat(b.importance ?? "") - parseFloat(a.importance ?? ""),
    );
  } catch (error) {
    // LocationIQ 404s when nothing matches; treat as no results, not an error.
    if (axios.isAxiosError(error) && error.response?.status === 404) return [];
    throw error;
  }
}
