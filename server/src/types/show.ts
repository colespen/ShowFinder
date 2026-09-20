/**
 * The shape every provider is mapped into and the merge operates on.
 * Mirrored by `client/src/datatypes/showData.ts` - keep the two in sync.
 */

export interface Performer {
  name: string;
  spotifyArtistId: string;
  spotifyUrl: string;
  website: string;
  /** The other provider's spelling of this act, used to resolve it on Spotify. */
  aliases?: string[];
}

export interface Venue {
  name: string;
  url: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
}

export interface Show {
  id: string;
  name: string;
  startDate: string;
  image: string;
  ticketUrl: string;
  venue: Venue;
  performers: Performer[];
}

export interface ShowPage {
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  /** Requests actually made upstream, not the provider's page count. */
  fetched: number;
}

export interface DateRange {
  minDate?: string;
  maxDate?: string;
}
