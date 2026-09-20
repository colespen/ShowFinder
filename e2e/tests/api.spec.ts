import { expect, test } from "@playwright/test";

const API = process.env.API_URL ?? "http://localhost:8001";

/** These exercise the real server; none of them reach an upstream API. */

test("health reports the upstream configuration", async ({ request }) => {
  const response = await request.get(`${API}/api/health`);
  const body = await response.json();

  expect([200, 503]).toContain(response.status());
  expect(body).toHaveProperty("configured.locationiq");
  expect(body).toHaveProperty("configured.rapidapi");
  expect(body).toHaveProperty("configured.spotify");
  expect(body).toHaveProperty("configured.ticketmaster");
  // Readiness follows the two sources a search needs; the other two only enrich.
  expect(body.ready).toBe(body.missing.length === 0);
});

test("a search without a city is rejected", async ({ request }) => {
  const response = await request.get(`${API}/api/newshows`);

  expect(response.status()).toBe(400);
  expect(await response.json()).toEqual({ error: "newCity is required" });
});

test("a search with unusable coordinates is rejected", async ({ request }) => {
  const response = await request.get(`${API}/api/shows?lat=0&lng=0`);

  expect(response.status()).toBe(400);
  expect((await response.json()).error).toContain("Valid lat and lng are required");
});

test("the api exposes no misconfigured upstream to the client", async ({ request }) => {
  const response = await request.get(`${API}/api/spotifysample`);

  expect(response.status()).toBe(200);
  // Must be a shaped response rather than an error, even with no artist asked for.
  expect(await response.json()).toEqual({ artist: null, tracks: [] });
});
