import assert from "node:assert/strict";
import { test } from "node:test";

import type { RapidEvent } from "../types/upstream/rapidapi.ts";
import { mapEvent, mapRapidEvents } from "./rapidShowMapper.ts";

const rawEvent: RapidEvent = {
  concert_id: "123",
  name: "Thee Sacred Souls @ RBC Amphitheatre",
  startDate: "2026-09-20T18:30:00",
  image: "https://image",
  location: {
    name: "RBC Amphitheatre",
    sameAs: "https://songkick.example/venue",
    address: { addressLocality: "Toronto" },
    geo: { latitude: 43.6292, longitude: -79.41507 },
  },
  performer: [{ name: "Thee Sacred Souls" }, { name: "LA LOM" }],
  organizer: { url: "https://songkick.example/concert" },
};

test("maps an aggregator event onto the canonical shape", () => {
  const show = mapEvent(rawEvent);

  assert.equal(show.id, "123");
  assert.equal(show.name, "Thee Sacred Souls @ RBC Amphitheatre");
  assert.equal(show.venue.name, "RBC Amphitheatre");
  assert.equal(show.venue.city, "Toronto");
  assert.equal(show.venue.url, "https://songkick.example/venue");
  assert.equal(show.ticketUrl, "https://songkick.example/concert");
  assert.deepEqual(
    show.performers.map((performer) => performer.name),
    ["Thee Sacred Souls", "LA LOM"],
  );
});

test("reads the aggregator's numeric coordinates", () => {
  assert.equal(mapEvent(rawEvent).venue.latitude, 43.6292);
  assert.equal(mapEvent(rawEvent).venue.longitude, -79.41507);
});

test("leaves Spotify fields empty - the aggregator supplies none", () => {
  const [performer] = mapEvent(rawEvent).performers;

  assert.equal(performer.spotifyArtistId, "");
  assert.equal(performer.spotifyUrl, "");
  assert.equal(performer.website, "");
});

test("nulls coordinates when the venue carries no geo", () => {
  const show = mapEvent({ concert_id: "1", location: { name: "Somewhere" } });

  assert.equal(show.venue.latitude, null);
  assert.equal(show.venue.longitude, null);
});

test("skips events without an id or a venue name", () => {
  const mapped = mapRapidEvents([
    rawEvent,
    { name: "no id", location: { name: "V" } },
    { concert_id: "9", name: "no venue" },
  ]);

  assert.deepEqual(
    mapped.map((show) => show.id),
    ["123"],
  );
});

test("de-duplicates a repeated concert id", () => {
  assert.equal(mapRapidEvents([rawEvent, rawEvent]).length, 1);
});
