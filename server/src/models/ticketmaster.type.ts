

export type TicketmasterEventData = Array<TicketmasterEvent>;

export type TicketmasterEvent = {
  id: string;
  name: string;
  url: URL;
  locale: string;
  images: Array<TicketmasterEventImage>;
  venues?: Array<TicketmasterEventVenue>;
  attractions?: Array<TicketmasterEventAttraction>;
};

export type TicketmasterEventImage = {
  url: URL;
  width: number;
  height: number;
  fallback: boolean
  ratio?: string; // "4_3" | "3_2" | "16_9",
  attribution?: string;
};

export type TicketmasterEventVenue = {
  id: string;
  name: string;
  url: URL;
  description?: string;
  address?: {
    line1?: string;
    line2?: string;
    line3?: string;
  };
  city?: {
    name: string;
  };
  state?: {
    stateCode?: string;
    name?: string;
  };
  country?: {
    countryCode?: string;
    name?: string;
  };
  location?: {
    longitude: string;
    latitude: string;
  },
};

export type TicketmasterEventAttraction = {
  id: string;
  name: string;
  url: URL;
  website?: URL;
  spotify?: {
    artistId?: string;
    profileUrl?: URL;
  };
};