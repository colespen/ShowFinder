import type { NewShowsResponse, ShowsResponse } from "../../server/src/types/api.ts";
import type { Performer } from "../../server/src/types/show.ts";

/** Frozen stand-ins for the API, so the browser tests never touch a live upstream. */

const performer = (name: string, aliases?: string[]): Performer => ({
  name,
  spotifyArtistId: "",
  spotifyUrl: "",
  website: "",
  ...(aliases ? { aliases } : {}),
});

export const torontoShows: ShowsResponse = {
  data: [
    {
      id: "tm-1",
      name: "The Charlatans UK North American Tour 2026",
      startDate: "2026-09-20T19:00:00",
      image: "",
      ticketUrl: "https://www.ticketmaster.ca/the-charlatans-uk",
      venue: {
        name: "The Danforth Music Hall",
        url: "",
        city: "Toronto",
        latitude: 43.67841,
        longitude: -79.35186,
      },
      performers: [performer("The Charlatans UK", ["The Charlatans"]), performer("Frankie Rose")],
    },
    {
      id: "tm-2",
      name: "Dua Saleh",
      startDate: "2026-09-20T20:00:00",
      image: "",
      ticketUrl: "https://www.ticketmaster.ca/dua-saleh",
      venue: {
        name: "The Mod Club",
        url: "",
        city: "Toronto",
        latitude: 43.66361,
        longitude: -79.41611,
      },
      performers: [performer("Dua Saleh")],
    },
    {
      id: "tm-3",
      name: "Point @ Sound Garage",
      startDate: "2026-09-21T19:00:00",
      image: "",
      ticketUrl: "https://www.songkick.com/concerts/43346334",
      venue: {
        name: "Sound Garage",
        url: "",
        city: "Toronto",
        latitude: 43.64521,
        longitude: -79.38059,
      },
      performers: [performer("Point")],
    },
    {
      // The aggregator omits a venue's geo often enough that the app must keep
      // these listed and simply give them no marker.
      id: "agg-1",
      name: "omri @ Soluna Toronto",
      startDate: "2026-09-20T16:00:00",
      image: "",
      ticketUrl: "https://www.songkick.com/concerts/43555031",
      venue: { name: "Soluna Toronto", url: "", city: "Toronto", latitude: null, longitude: null },
      performers: [performer("omri")],
    },
  ],
  currentAddress: {
    display_name: "Toronto, Ontario, Canada",
    address: { city: "Toronto", state: "Ontario", country: "Canada", country_code: "ca" },
  },
  page: { number: 0, size: 50, totalElements: 4, totalPages: 1, fetched: 4 },
};

export const austinShows: NewShowsResponse = {
  data: [
    {
      id: "atx-1",
      name: "Born Without Bones",
      startDate: "2026-09-20T19:00:00",
      image: "",
      ticketUrl: "https://www.ticketmaster.com/born-without-bones",
      venue: {
        name: "Empire Control Room",
        url: "",
        city: "Austin",
        latitude: 30.26715,
        longitude: -97.74306,
      },
      performers: [performer("Born Without Bones")],
    },
  ],
  latLng: [{ lat: "30.2672", lon: "-97.7431", display_name: "Austin, Texas, United States" }],
  currentAddress: { address: { city: "Austin", state: "Texas", country_code: "us" } },
  page: { number: 0, size: 50, totalElements: 1, totalPages: 1, fetched: 1 },
};
