/**
 * The aggregator's `/location` payload, trimmed to the fields the mapper reads.
 * Unlike Ticketmaster, coordinates arrive as numbers.
 */

export interface RapidAddress {
  addressLocality?: string;
  addressRegion?: string;
  addressCountry?: string;
  postalCode?: string;
  streetAddress?: string;
}

export interface RapidLocation {
  name?: string;
  sameAs?: string;
  address?: RapidAddress;
  geo?: { latitude?: number; longitude?: number };
}

export interface RapidPerformer {
  name?: string;
  artist_id?: string;
}

export interface RapidEvent {
  concert_id?: string;
  name?: string;
  startDate?: string;
  endDate?: string;
  image?: string;
  location?: RapidLocation;
  performer?: RapidPerformer[];
  organizer?: { name?: string; url?: string };
}

/** An unresolvable name comes back as HTTP 200 with an `error` field. */
export interface RapidLocationResponse {
  data?: RapidEvent[];
  page?: unknown;
  error?: string;
}
