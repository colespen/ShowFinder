const axios = require("axios");
const { parseDateRange } = require("../utils/location");

const HOST = "https://app.ticketmaster.com/discovery/v2/events.json";
// Discovery caps `size` at 200 (500 is rejected outright).
const PAGE_SIZE = 200;
const MAX_PAGES = 3;
const DEFAULT_RADIUS_MILES = 50;

/**
 * Discovery accepts only `YYYY-MM-DDTHH:mm:ssZ` and 400s on the millisecond
 * form `toISOString()` produces, so the fraction is dropped here.
 */
function toDiscoveryDateTime(ymd, endOfDay) {
  const [year, month, day] = String(ymd || "")
    .split("-")
    .map((part) => Number(part));
  if (![year, month, day].every(Number.isFinite)) return "";
  const pad = (value) => String(value).padStart(2, "0");
  const time = endOfDay ? "23:59:59" : "00:00:00";
  return `${year}-${pad(month)}-${pad(day)}T${time}Z`;
}

function toCoord(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

/** Prefers the largest 16:9 image, falling back to any available image. */
function pickImage(images = []) {
  if (!Array.isArray(images) || !images.length) return "";
  const wide = images.filter((image) => image?.ratio === "16_9" && image.url);
  const pool = wide.length ? wide : images.filter((image) => image?.url);
  if (!pool.length) return "";
  return (
    pool.reduce((best, image) =>
      Number(image.width) > Number(best.width) ? image : best,
    ).url || ""
  );
}

/** The audio player expects an ISO-ish local datetime. */
function toLocalDateTime(start = {}) {
  if (start.localDate && start.localTime) {
    return `${start.localDate}T${start.localTime}`;
  }
  return start.localDate || start.dateTime || "";
}

/** Discovery embeds the Spotify artist link, sparing a separate lookup. */
function spotifyArtistId(attraction = {}) {
  const links = attraction.externalLinks?.spotify;
  if (!Array.isArray(links) || !links.length) return "";
  try {
    const profile = new URL(links[0].url);
    const parts = profile.pathname.split("/").filter(Boolean);
    return parts[0] === "artist" && parts[1] ? parts[1] : "";
  } catch (error) {
    return "";
  }
}

function mapVenue(venue = {}) {
  return {
    name: venue.name || "",
    url: venue.url || "",
    city: venue.city?.name || venue.address?.city || "",
    latitude: toCoord(venue.location?.latitude),
    longitude: toCoord(venue.location?.longitude),
  };
}

function mapPerformer(attraction = {}) {
  const artistId = spotifyArtistId(attraction);
  return {
    name: attraction.name || "",
    spotifyArtistId: artistId,
    spotifyUrl: artistId ? `https://open.spotify.com/artist/${artistId}` : "",
    website: attraction.externalLinks?.homepage?.[0]?.url || "",
  };
}

/** Falls back to the event name when Discovery lists no attractions. */
function mapEvent(event = {}) {
  const venue = mapVenue(event._embedded?.venues?.[0] || {});
  const performers = (event._embedded?.attractions || [])
    .map(mapPerformer)
    .filter((performer) => performer.name);

  if (!performers.length && event.name) {
    performers.push({
      name: event.name,
      spotifyArtistId: "",
      spotifyUrl: "",
      website: "",
    });
  }

  return {
    id: String(event.id || ""),
    name: event.name || "",
    startDate: toLocalDateTime(event.dates?.start),
    image: pickImage(event.images),
    ticketUrl: event.url || "",
    venue,
    performers,
  };
}

function mapTicketmasterEvents(rawEvents = []) {
  const seen = new Set();
  const mapped = [];
  for (const event of rawEvents) {
    if (!event?.id || seen.has(event.id)) continue;
    const show = mapEvent(event);
    // Coordinate-less venues cannot be plotted and break marker alignment.
    if (!show.venue.name || show.venue.latitude === null) continue;
    seen.add(event.id);
    mapped.push(show);
  }
  return mapped;
}

async function fetchPage({ apiKey, lat, lng, radius, minDate, maxDate, page }) {
  const params = new URLSearchParams({
    apikey: apiKey,
    // Discovery silently ignores the `geoPoint` geohash parameter and returns
    // every event nationwide; `latlong` is the only correct geo filter.
    latlong: `${lat},${lng}`,
    radius: String(radius),
    unit: "miles",
    size: String(PAGE_SIZE),
    page: String(page),
    sort: "date,asc",
    classificationName: "music",
    startDateTime: toDiscoveryDateTime(minDate, false),
    endDateTime: toDiscoveryDateTime(maxDate, true),
  });

  const response = await axios.get(`${HOST}?${params.toString()}`, {
    timeout: 15000,
  });
  return response.data || {};
}

/**
 * Discovery is coordinate-first, so passing real lat/long sidesteps the
 * city-name resolution problems the name-based upstream suffers from.
 */
async function searchMusicEvents({ lat, lng, dateRange, radius }) {
  const apiKey = process.env.TICKETMASTER_KEY;
  if (!apiKey) {
    throw new Error("TICKETMASTER_KEY is not configured");
  }

  const latitude = Number(lat);
  const longitude = Number(lng);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error("Valid lat and lng are required for Ticketmaster");
  }

  const { minDate, maxDate } = parseDateRange(dateRange);
  const radiusMiles = Number(radius) > 0 ? Number(radius) : DEFAULT_RADIUS_MILES;

  const rawEvents = [];
  let upstreamTotal = 0;
  let requests = 0;
  let page = 0;

  while (page < MAX_PAGES) {
    const body = await fetchPage({
      apiKey,
      lat: latitude,
      lng: longitude,
      radius: radiusMiles,
      minDate,
      maxDate,
      page,
    });
    requests += 1;

    upstreamTotal = body.page?.totalElements ?? rawEvents.length;
    const events = body._embedded?.events || [];
    if (!events.length) break;
    rawEvents.push(...events);

    if (events.length < PAGE_SIZE || rawEvents.length >= upstreamTotal) break;
    page += 1;
  }

  const data = mapTicketmasterEvents(rawEvents);
  return {
    data,
    page: {
      number: 0,
      size: PAGE_SIZE,
      totalElements: upstreamTotal,
      totalPages: requests,
      fetched: data.length,
    },
  };
}

module.exports = {
  searchMusicEvents,
  mapTicketmasterEvents,
  toDiscoveryDateTime,
  DEFAULT_RADIUS_MILES,
};
