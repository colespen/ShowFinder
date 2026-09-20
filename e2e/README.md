# End-to-end tests

Playwright suite covering the browser flow and the API's request validation. It
lives in its own package so the browser downloads never touch the Render or
Amplify builds.

```bash
cd e2e
npm install
npx playwright install chromium   # once
npm test
```

`playwright.config.ts` starts what it needs. Anything already listening on 3000
or 8001 is reused locally; in CI both are started fresh.

## What is covered

`tests/shows.spec.ts` drives the browser with the API mocked, so it is fast and
never depends on a live upstream:

- shows load for the visitor's location, and only plotted shows get a marker
- a show without coordinates stays listed but opens no popup
- clicking a drawer row opens *that row's* marker (markers are keyed by show id)
- the resolved artist's preview plays and the Spotify link enables
- no resolved artist leaves the link disabled rather than pointing somewhere wrong
- searching a city replaces the results
- the date range is sent as nested `dateRange[minDate]` params

`tests/api.spec.ts` calls the real server for the paths that need no upstream:
health, and the two validation rejections.

## Notes

The drawer is translated off-screen when closed, and an off-screen element still
counts as visible to Playwright, so the helper asserts its position rather than
its visibility.
