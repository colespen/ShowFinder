const axios = require("axios");
const { encodeGeohash } = require("../utils/geohash");
const { parseDateRange, toLocalBound } = require("../utils/location");
const { mapEvents } = require("../mappers/showMapper");

const PAGE_SIZE = 200;
const MAX_EVENTS = 400;
const RADIUS_MILES = 50;
const GEOHASH_PRECISION = 7;
const PAGE_DELAY_MS = 250;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function emptyPage() {
  return {
    number: 0,
    size: PAGE_SIZE,
    totalElements: 0,
    totalPages: 0,
    fetched: 0,
  };
}

async function fetchEventsPage({ apiKey, geoPoint, localStartDateTime, page }) {
  const params = new URLSearchParams({
    apikey: apiKey,
    geoPoint,
    radius: String(RADIUS_MILES),
    unit: "miles",
    classificationName: "music",
    localStartDateTime,
    size: String(PAGE_SIZE),
    page: String(page),
    sort: "date,asc",
    includeTBA: "no",
    includeTBD: "no",
  });

  const response = await axios.get(
    `https://app.ticketmaster.com/discovery/v2/events.json?${params.toString()}`,
    { timeout: 15000 },
  );

  const available = response.headers?.["rate-limit-available"];
  if (available !== undefined) {
    console.log("Ticketmaster Rate-Limit-Available:", available);
  }

  const rawEvents = response.data?._embedded?.events || [];
  const pageInfo = response.data?.page || {};
  return {
    events: rawEvents,
    page: {
      number: Number(pageInfo.number || page),
      size: Number(pageInfo.size || PAGE_SIZE),
      totalElements: Number(pageInfo.totalElements || 0),
      totalPages: Number(pageInfo.totalPages || 0),
    },
  };
}

async function searchMusicEvents({ lat, lng, dateRange }) {
  const apiKey = process.env.TICKETMASTER_KEY;
  if (!apiKey) {
    throw new Error("TICKETMASTER_KEY is not configured");
  }

  const geoPoint = encodeGeohash(lat, lng, GEOHASH_PRECISION);
  const { minDate, maxDate } = parseDateRange(dateRange);
  const localStartDateTime = `${toLocalBound(minDate, false)},${toLocalBound(
    maxDate,
    true,
  )}`;

  const rawEvents = [];
  let pageMeta = emptyPage();
  let page = 0;

  while (rawEvents.length < MAX_EVENTS) {
    if (page * PAGE_SIZE >= 1000) break;

    const result = await fetchEventsPage({
      apiKey,
      geoPoint,
      localStartDateTime,
      page,
    });

    pageMeta = {
      ...result.page,
      fetched: 0,
    };
    rawEvents.push(...result.events);

    const nextPage = page + 1;
    const hasMore =
      nextPage < result.page.totalPages &&
      rawEvents.length < MAX_EVENTS &&
      rawEvents.length < result.page.totalElements &&
      nextPage * PAGE_SIZE < 1000;

    if (!hasMore) break;
    page = nextPage;
    await sleep(PAGE_DELAY_MS);
  }

  const data = mapEvents(rawEvents).slice(0, MAX_EVENTS);
  return {
    data,
    page: {
      ...pageMeta,
      fetched: data.length,
    },
  };
}

module.exports = { searchMusicEvents };
