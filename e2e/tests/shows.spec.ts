import { expect, test } from "@playwright/test";
import type { Page, Route } from "@playwright/test";

import { austinShows, torontoShows } from "../fixtures/shows.ts";

const json = (route: Route, body: unknown) => route.fulfill({ json: body as object });

/** Derived from the fixture so the tests stay honest about what is plotted. */
const plotted = torontoShows.data.filter((show) => show.venue.latitude !== null);
const unplotted = torontoShows.data.filter((show) => show.venue.latitude === null);
const headliner = (show: (typeof torontoShows.data)[number]) => show.performers[0].name;

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
  const days = page.locator(
    ".react-datepicker__day:not(.react-datepicker__day--disabled):not(.react-datepicker__day--outside-month)",
  );
  await days.nth(0).click();
  await days.nth(2).click();

  await expect.poll(() => requests.filter((url) => url.includes("dateRange")).length).toBeGreaterThan(0);

  // The server reads these with Express's extended query parser; the simple
  // parser drops them and every search silently widens back to today.
  const ranged = decodeURIComponent(requests.find((url) => url.includes("dateRange")) as string);
  expect(ranged).toContain("dateRange[minDate]=");
  expect(ranged).toContain("dateRange[maxDate]=");
});
