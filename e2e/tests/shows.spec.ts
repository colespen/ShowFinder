import { expect, test } from "@playwright/test";
import type { Page, Route } from "@playwright/test";

import { austinShows, torontoShows } from "../fixtures/shows.ts";

const json = (route: Route, body: unknown) => route.fulfill({ json: body as object });

/** Derived from the fixture so the tests stay honest about what is plotted. */
const plotted = torontoShows.data.filter((show) => show.venue.latitude !== null);
const unplotted = torontoShows.data.filter((show) => show.venue.latitude === null);
const headliner = (show: (typeof torontoShows.data)[number]) => show.performers[0].name;

/** A narrower answer for the same city, for the date-range flow. */
const narrowed = { ...torontoShows, data: torontoShows.data.slice(0, 2) };
const narrowedPlotted = narrowed.data.filter((show) => show.venue.latitude !== null);

const selectableDays = (page: Page) =>
  page.locator(
    ".react-datepicker__day:not(.react-datepicker__day--disabled):not(.react-datepicker__day--outside-month)",
  );

const paramsOf = (url: string) => new URL(url).searchParams;

/**
 * Picking days only fills in state; the GO button beside the calendar is what
 * asks the server, which is why the date tests drive both.
 */
const requestPickedRange = (page: Page) => page.locator("#go-button-top").click();

/**
 * The server writes dates as YYYY-M-D, so compare them as calendar days rather
 * than through Date parsing. The first request of a session always carries
 * today..today, which is how the range tests tell it from one after a pick.
 */
function rangeGapInDays(params: URLSearchParams): number | null {
  const min = params.get("dateRange[minDate]");
  const max = params.get("dateRange[maxDate]");
  if (!min || !max) return null;

  const [minYear, minMonth, minDay] = min.split("-").map(Number);
  const [maxYear, maxMonth, maxDay] = max.split("-").map(Number);

  return Math.round(
    (Date.UTC(maxYear, maxMonth - 1, maxDay) - Date.UTC(minYear, minMonth - 1, minDay)) / 86_400_000,
  );
}

/**
 * The drawer sits translated off-screen until toggled, and an off-screen element
 * still counts as visible to Playwright, so assert its position rather than its
 * visibility.
 */
async function drawerIsOpen(page: Page): Promise<boolean> {
  const box = await page.locator(".show-list-item").first().boundingBox();
  return (box?.x ?? -1) >= 0;
}

async function openDrawer(page: Page): Promise<void> {
  await expect(page.locator(".show-list-item").first()).toBeAttached();
  if (!(await drawerIsOpen(page))) {
    await page.locator(".button-wrapper button").click();
  }
  await expect.poll(() => drawerIsOpen(page)).toBe(true);
}

const rowFor = (page: Page, label: string) =>
  page.locator(".show-list-item").filter({ hasText: label }).first();

test.beforeEach(async ({ page }) => {
  await page.route("**/api/shows**", (route) => json(route, torontoShows));
});

test("loads shows for the visitor's location", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator(".title-show")).toHaveText("shows in Toronto");
  await expect(page.locator(".leaflet-marker-icon")).toHaveCount(plotted.length);
});

test("a show without coordinates is listed but has no marker", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".leaflet-marker-icon")).toHaveCount(plotted.length);

  await openDrawer(page);
  await expect(page.locator(".show-list-item")).toHaveCount(torontoShows.data.length);

  const row = rowFor(page, headliner(unplotted[0]));
  await expect(row).toBeVisible();
  await row.click();

  // No coordinates means no marker, so there is no popup to open. The row stays
  // listed so its ticket and venue links remain reachable.
  await expect(page.locator(".leaflet-popup-content")).toHaveCount(0);
});

test("clicking a drawer row opens that row's own marker", async ({ page }) => {
  await page.goto("/");
  await openDrawer(page);

  // Ordering is by proximity, so look each row up by name instead of assuming a
  // position. This is the invariant that broke when markers were keyed by index.
  for (const show of plotted) {
    const label = headliner(show);
    await rowFor(page, label).click();

    const popup = page.locator(".leaflet-popup-content").first();
    await expect(popup).toBeVisible();
    await expect(popup).toContainText(label);

    await page.keyboard.press("Escape");
  }
});

test("plays the resolved artist's preview and links to it", async ({ page }) => {
  await page.route("**/api/spotifysample**", (route) =>
    json(route, {
      artist: { id: "sp-1", name: "The Charlatans", spotifyUrl: "https://open.spotify.com/artist/sp-1" },
      tracks: [
        { id: "tr-1", name: "The Only One I Know", preview_url: "https://p.scdn.co/mp3-preview/mock" },
      ],
    }),
  );
  await page.goto("/");
  await page.locator(".leaflet-marker-icon").first().click();

  await expect(page.locator(".music-link")).toBeEnabled();
  await expect(page.locator("audio.audio-player")).toHaveAttribute(
    "src",
    /p\.scdn\.co\/mp3-preview\/mock/,
  );
});

test("leaves the Spotify link disabled when no artist is resolved", async ({ page }) => {
  await page.route("**/api/spotifysample**", (route) =>
    json(route, { artist: null, tracks: [] }),
  );
  await page.goto("/");
  await page.locator(".leaflet-marker-icon").first().click();

  await expect(page.locator(".music-link")).toBeDisabled();
});

test("searching a city replaces the results", async ({ page }) => {
  await page.route("**/api/newshows**", (route) => json(route, austinShows));
  await page.goto("/");
  await expect(page.locator(".title-show")).toHaveText("shows in Toronto");

  await page.locator('input[name="enter city"]').fill("Austin");
  await page.locator(".city-input button").click();

  await expect(page.locator(".title-show")).toHaveText("shows in Austin");
  await expect(page.locator(".leaflet-marker-icon")).toHaveCount(austinShows.data.length);
});

test("sends the chosen date range as nested query params", async ({ page }) => {
  const requests: string[] = [];
  await page.route("**/api/shows**", (route) => {
    requests.push(route.request().url());
    return json(route, torontoShows);
  });
  await page.goto("/");

  await page.locator(".date-button-input").first().click();
  await selectableDays(page).nth(0).click();
  await selectableDays(page).nth(2).click();
  await requestPickedRange(page);

  // The range the picker produced, rather than the today..today the first load
  // sends: whatever is picked has to be what the server is asked for.
  await expect
    .poll(() => rangeGapInDays(paramsOf(requests[requests.length - 1])))
    .toBe(2);

  // The server reads these with Express's extended query parser; the simple
  // parser leaves them flat and every search silently widens back to today.
  const ranged = decodeURIComponent(requests[requests.length - 1]);
  expect(ranged).toContain("dateRange[minDate]=");
  expect(ranged).toContain("dateRange[maxDate]=");
});

test("narrowing the date range replaces the results", async ({ page }) => {
  // Keyed on the range widening, since the unpicked default is today..today.
  await page.route("**/api/shows**", (route) =>
    json(route, rangeGapInDays(paramsOf(route.request().url())) === 0 ? torontoShows : narrowed),
  );
  await page.goto("/");
  await expect(page.locator(".leaflet-marker-icon")).toHaveCount(plotted.length);

  await page.locator(".date-button-input").first().click();
  await selectableDays(page).nth(0).click();
  await selectableDays(page).nth(2).click();
  await requestPickedRange(page);

  // Both the map and the list have to follow the new answer, rather than keep
  // showing the wider set the first request returned.
  await expect(page.locator(".leaflet-marker-icon")).toHaveCount(narrowedPlotted.length);
  await openDrawer(page);
  await expect(page.locator(".show-list-item")).toHaveCount(narrowed.data.length);
});

test("limits a picked range to the fourteen-day window", async ({ page }) => {
  const gaps: (number | null)[] = [];
  await page.route("**/api/shows**", (route) => {
    gaps.push(rangeGapInDays(paramsOf(route.request().url())));
    return json(route, torontoShows);
  });
  await page.goto("/");
  await page.locator(".date-button-input").first().click();

  // The window is the calendar's own bound: the first pick narrows the selectable
  // days to that day plus fourteen, so the last one cannot reach past it. Only one
  // month renders, and react-datepicker restarts the range if the second pick is
  // the earlier date, so the reachable order is first-day then last-day.
  const days = selectableDays(page);
  await days.first().click();
  const firstDay = Number(await days.first().textContent());
  const lastDay = Number(await days.last().textContent());
  await days.last().click();
  await requestPickedRange(page);

  // The calendar allowed a fourteen-day span and that is what gets sent.
  const span = lastDay - firstDay;
  expect(span).toBe(14);
  await expect.poll(() => gaps[gaps.length - 1]).toBe(span);
});

