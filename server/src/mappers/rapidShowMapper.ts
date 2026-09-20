import type { Performer, Show, Venue } from "../types/show.ts";
import type {
  RapidEvent,
  RapidLocation,
  RapidPerformer,
} from "../types/upstream/rapidapi.ts";

function toCoord(value: unknown): number | null {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function mapVenue(location: RapidLocation = {}): Venue {
  const address = location.address ?? {};
  return {
    name: location.name ?? "",
    url: location.sameAs ?? "",
    city: address.addressLocality ?? "",
    latitude: toCoord(location.geo?.latitude),
    longitude: toCoord(location.geo?.longitude),
  };
}

/** The aggregator returns no Spotify or homepage links for artists. */
function mapPerformer(performer: RapidPerformer = {}): Performer {
  return {
    name: performer.name ?? "",
    spotifyArtistId: "",
    spotifyUrl: "",
    website: "",
  };
}

export function mapEvent(event: RapidEvent = {}): Show {
  const venue = mapVenue(event.location ?? {});
  const performers = (event.performer ?? [])
    .map(mapPerformer)
    .filter((performer) => performer.name);

  return {
    id: String(event.concert_id ?? ""),
    name: event.name ?? "",
    startDate: event.startDate ?? "",
    image: event.image ?? "",
    ticketUrl: event.organizer?.url ?? "",
    venue,
    performers,
  };
}

export function mapRapidEvents(rawEvents: RapidEvent[] = []): Show[] {
  const seen = new Set<string>();
  const mapped: Show[] = [];

  for (const event of rawEvents) {
    if (!event?.concert_id || seen.has(event.concert_id)) continue;
    const show = mapEvent(event);
    if (!show.venue.name) continue;
    seen.add(event.concert_id);
    mapped.push(show);
  }

  return mapped;
}

