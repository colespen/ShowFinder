const axios = require("axios");
const { parseDateRange } = require("../utils/location");
const { mapRapidEvents } = require("../mappers/rapidShowMapper");

const HOST = "concerts-artists-events-tracker.p.rapidapi.com";
const MAX_EVENTS = 400;
const MAX_PAGES = 8;
const PAGE_DELAY_MS = 200;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toRapidDate(dateStr) {
  // RapidAPI expects unpadded YYYY-M-D (e.g. 2026-9-20), matching
  // the client's DateRange format already, but normalize defensively.
  const parts = String(dateStr || "")
    .split("-")
    .map((part) => Number(part));
  if (parts.length < 3 || parts.some((part) => !Number.isFinite(part))) {
    return dateStr;
  }
  const [year, month, day] = parts;
  return `${year}-${month}-${day}`;
}

async function fetchLocationPage({ apiKey, name, minDate, maxDate, page }) {
  const params = new URLSearchParams({
    name,
    minDate,
    maxDate,
    page: String(page),
  });

  const response = await axios.get(
    `https://${HOST}/location?${params.toString()}`,
    {
      headers: {
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": HOST,
      },
      timeout: 15000,
    },
  );

  const remaining = response.headers?.["x-ratelimit-requests-remaining"];
  if (remaining !== undefined) {
    console.log("RapidAPI requests remaining:", remaining);
  }

  if (response.data?.error) {
    throw new Error(response.data.error);
  }

  return Array.isArray(response.data?.data) ? response.data.data : [];
}

/**
 * fetchLocationPage occasionally returns a transient upstream error
 * ("Invalid location") even for a valid city name. Retry a few times
 * before giving up on a page.
 */
async function fetchLocationPageWithRetry(args, retries = 4) {
  let lastErr;
  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      return await fetchLocationPage(args);
    } catch (err) {
      lastErr = err;
      await sleep(500);
    }
  }
  throw lastErr;
}

async function searchMusicEvents({ cityName, dateRange }) {
  const apiKey = process.env.RAPID_KEY;
  if (!apiKey) {
    throw new Error("RAPID_KEY is not configured");
  }
  if (!cityName) {
    throw new Error("cityName is required");
  }

  const { minDate, maxDate } = parseDateRange(dateRange);
  const name = cityName;
  const minDateParam = toRapidDate(minDate);
  const maxDateParam = toRapidDate(maxDate);

  const rawEvents = [];
  let page = 1;

  while (rawEvents.length < MAX_EVENTS && page <= MAX_PAGES) {
    const events = await fetchLocationPageWithRetry({
      apiKey,
      name,
      minDate: minDateParam,
      maxDate: maxDateParam,
      page,
    });

    if (!events.length) break;
    rawEvents.push(...events);

    if (events.length < 50) break; // short page = last page
    page += 1;
    await sleep(PAGE_DELAY_MS);
  }

  const data = mapRapidEvents(rawEvents).slice(0, MAX_EVENTS);
  return {
    data,
    page: {
      number: 0,
      size: 50,
      totalElements: data.length,
      totalPages: page,
      fetched: data.length,
    },
  };
}

module.exports = { searchMusicEvents };
