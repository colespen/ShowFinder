/**
 * Ticketmaster Discovery `/discovery/v2/events.json`, trimmed to the fields the
 * mapper reads. Venues and attractions arrive under `_embedded`, and venue
 * coordinates are strings.
 */

export interface TicketmasterPage {
  size?: number;
  totalElements?: number;
  totalPages?: number;
  number?: number;
}

export interface TicketmasterImage {
  url?: string;
  ratio?: string;
  width?: number;
  height?: number;
  fallback?: boolean;
}

export interface TicketmasterDateStart {
  localDate?: string;
  localTime?: string;
  dateTime?: string;
  dateTBD?: boolean;
  dateTBA?: boolean;
  timeTBA?: boolean;
  noSpecificTime?: boolean;
}

export interface TicketmasterDates {
  start?: TicketmasterDateStart;
  timezone?: string;
  status?: { code?: string };
}

export interface TicketmasterVenue {
  name?: string;
  url?: string;
  city?: { name?: string };
  address?: { city?: string };
  location?: { latitude?: string; longitude?: string };
}

export interface TicketmasterLink {
  url?: string;
}

export interface TicketmasterAttraction {
  id?: string;
  name?: string;
  externalLinks?: {
    spotify?: TicketmasterLink[];
    homepage?: TicketmasterLink[];
    [key: string]: TicketmasterLink[] | undefined;
  };
}

export interface TicketmasterEvent {
  id?: string;
  name?: string;
  url?: string;
  images?: TicketmasterImage[];
  dates?: TicketmasterDates;
  _embedded?: {
    venues?: TicketmasterVenue[];
    attractions?: TicketmasterAttraction[];
  };
}

export interface TicketmasterEventsResponse {
  page?: TicketmasterPage;
  _embedded?: { events?: TicketmasterEvent[] };
}
