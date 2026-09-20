function toCoord(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function mapVenue(location = {}) {
  const address = location.address || {};
  return {
    name: location.name || "",
    url: location.sameAs || "",
    city: address.addressLocality || "",
    latitude: toCoord(location.geo?.latitude),
    longitude: toCoord(location.geo?.longitude),
  };
}

function mapPerformer(performer = {}) {
  // /location returns no Spotify or homepage links for artists.
  return {
    name: performer.name || "",
    spotifyArtistId: "",
    spotifyUrl: "",
    website: "",
  };
}

function mapEvent(event = {}) {
  const venue = mapVenue(event.location || {});
  const performers = (event.performer || [])
    .map(mapPerformer)
    .filter((p) => p.name);

  return {
    id: String(event.concert_id || ""),
    name: event.name || "",
    startDate: event.startDate || "",
    image: event.image || "",
    ticketUrl: event.organizer?.url || "",
    venue,
    performers,
  };
}

function mapRapidEvents(rawEvents = []) {
  const seen = new Set();
  const mapped = [];
  for (const event of rawEvents) {
    if (!event?.concert_id || seen.has(event.concert_id)) continue;
    const show = mapEvent(event);
    if (!show.venue.name) continue;
    seen.add(event.concert_id);
    mapped.push(show);
  }
  return mapped;
}

module.exports = { mapRapidEvents, mapEvent };
