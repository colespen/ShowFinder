function pickImage(images = []) {
  const list = Array.isArray(images) ? images.filter((img) => img && img.url) : [];
  if (!list.length) return "";
  const preferred = list.filter((img) => !img.fallback);
  const pool = preferred.length ? preferred : list;
  pool.sort((a, b) => Number(b.width || 0) - Number(a.width || 0));
  return pool[0].url;
}

function parseSpotify(externalLinks = {}) {
  const spotify = Array.isArray(externalLinks.spotify)
    ? externalLinks.spotify[0]
    : null;
  const profileUrl = spotify?.url || "";
  let artistId = "";
  if (profileUrl) {
    try {
      const { pathname } = new URL(profileUrl);
      const segments = pathname.split("/").filter(Boolean);
      if (segments[0] === "artist" && segments[1]) {
        artistId = segments[1];
      }
    } catch (_err) {
      // ignore malformed URLs
    }
  }
  return { artistId, profileUrl };
}

function mapAttraction(attraction = {}) {
  const { artistId, profileUrl } = parseSpotify(attraction.externalLinks || {});
  const homepage = Array.isArray(attraction.externalLinks?.homepage)
    ? attraction.externalLinks.homepage[0]?.url
    : "";
  return {
    name: attraction.name || "",
    ticketmasterId: attraction.id || "",
    spotifyArtistId: artistId || "",
    spotifyUrl: profileUrl || "",
    website: homepage || attraction.url || "",
  };
}

function mapStartDate(dates = {}) {
  const start = dates.start || {};
  if (start.dateTime) return start.dateTime;
  if (start.localDate && start.localTime) {
    return `${start.localDate}T${start.localTime}`;
  }
  if (start.localDate) return `${start.localDate}T00:00:00`;
  return "";
}

function toCoord(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function mapVenue(venue = {}) {
  const location = venue.location || {};
  return {
    name: venue.name || "",
    url: venue.url || "",
    city: venue.city?.name || "",
    latitude: toCoord(location.latitude),
    longitude: toCoord(location.longitude),
  };
}

function mapEvent(event = {}) {
  const venues = event._embedded?.venues || [];
  const attractions = event._embedded?.attractions || [];
  const venue = mapVenue(venues[0] || {});
  const performers = attractions.map(mapAttraction).filter((p) => p.name);

  return {
    id: event.id,
    name: event.name || "",
    startDate: mapStartDate(event.dates),
    image: pickImage(event.images),
    ticketUrl: event.url || "",
    venue,
    performers,
  };
}

function mapEvents(rawEvents = []) {
  const seen = new Set();
  const mapped = [];
  for (const event of rawEvents) {
    if (!event?.id || seen.has(event.id)) continue;
    const show = mapEvent(event);
    if (!show.venue.name) continue;
    seen.add(event.id);
    mapped.push(show);
  }
  return mapped;
}

module.exports = { mapEvents, mapEvent };
