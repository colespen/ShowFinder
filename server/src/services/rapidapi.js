const axios = require("axios");
const { parseDateRange } = require("../utils/location");
const { mapRapidEvents } = require("../mappers/rapidShowMapper");

const HOST = "concerts-artists-events-tracker.p.rapidapi.com";
// Hard ceilings per search: at most MAX_PAGES requests / MAX_EVENTS shows. A
// 14-day window in a dense city fills this budget, so it is a deliberate
// quota/coverage tradeoff.
const MAX_EVENTS = 400;
const MAX_PAGES = 5;
const PAGE_DELAY_MS = 200;
const PAGE_SIZE = 50; // upstream caps /location at 50 per page

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// RapidAPI wants unpadded YYYY-M-D (2026-9-20), not the padded form.
function toRapidDate(dateStr) {
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
    // Returned with HTTP 200 when a name is unresolvable, e.g.
    // "London, United Kingdom". Flagged so callers widen instead of retrying.
    const err = new Error(response.data.error);
    err.upstreamInvalidLocation = /invalid location/i.test(response.data.error);
    throw err;
  }

  return Array.isArray(response.data?.data) ? response.data.data : [];
}

// Administrative prefixes that turn a place name into a borough the upstream
// cannot resolve (LocationIQ reports central London as "City of Westminster",
// which maps to Sydney shows).
const ADMIN_PREFIX = /^(city of|royal borough of|london borough of|borough of|county of|metropolitan borough of)\s+/i;

function withoutAdminPrefix(name) {
  const stripped = String(name || "").replace(ADMIN_PREFIX, "").trim();
  return stripped && stripped !== name ? stripped : "";
}

/** Retries transient failures; "Invalid location" is deterministic, so it is
 * surfaced immediately for the caller to widen the query. */
async function fetchLocationPageWithRetry(args, retries = 4) {
  let lastErr;
  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      return await fetchLocationPage(args);
    } catch (err) {
      if (err.upstreamInvalidLocation) throw err;
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
  let requests = 0;

  while (rawEvents.length < MAX_EVENTS && page <= MAX_PAGES) {
    const events = await fetchLocationPageWithRetry({
      apiKey,
      name,
      minDate: minDateParam,
      maxDate: maxDateParam,
      page,
    });
    requests += 1;

    if (!events.length) break;
    rawEvents.push(...events);

    if (events.length < PAGE_SIZE) break; // short page = last page
    page += 1;
    await sleep(PAGE_DELAY_MS);
  }

  const data = mapRapidEvents(rawEvents).slice(0, MAX_EVENTS);
  return {
    data,
    page: {
      number: 0,
      size: PAGE_SIZE,
      totalElements: data.length,
      // Upstream requests actually made, capped at MAX_PAGES.
      totalPages: requests,
      fetched: data.length,
    },
  };
}

module.exports = { searchMusicEvents, withoutAdminPrefix };
