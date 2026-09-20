import assert from "node:assert/strict";
import { test } from "node:test";

import type { Performer, Show, Venue } from "../types/show.ts";
import { mergeShows } from "./mergeShows.ts";

const venue = (name: string): Venue => ({
  name,
  url: "",
  city: "Toronto",
  latitude: 43.66,
  longitude: -79.4,
});

const performers = (...names: string[]): Performer[] =>
  names.map((name) => ({ name, spotifyArtistId: "", spotifyUrl: "", website: "" }));

const show = (
  id: string,
  startDate: string,
  venueName: string,
  ...performerNames: string[]
): Show => ({
  id,
  name: `${performerNames[0] ?? ""} at ${venueName}`,
  startDate,
  image: "",
  ticketUrl: "",
  venue: venue(venueName),
  performers: performers(...performerNames),
});

test("merges a co-bill each source headlines differently", () => {
  const { data, duplicates } = mergeShows(
    [show("tm", "2026-09-22T20:00:00", "Blue Note", "Eric Gales")],
    [show("agg", "2026-09-22T20:00:00", "Blue Note", "Baby Rose")],
  );

  assert.equal(data.length, 1);
  assert.equal(duplicates, 1);
});

test("keeps both sets when one act plays a room twice in a night", () => {
  const { data } = mergeShows([
    show("early", "2026-09-22T20:00:00", "Blue Note", "Eric Gales"),
    show("late", "2026-09-22T22:30:00", "Blue Note", "Eric Gales"),
  ]);

  assert.equal(data.length, 2, "8pm and 10:30pm are different shows");
});

test("does not merge nested venue names at the same minute", () => {
  const { data } = mergeShows([
    show("rebel", "2026-09-26T22:00:00", "REBEL", "Band One"),
    show("noir", "2026-09-26T22:00:00", "NOIR (inside REBEL)", "Band Two"),
  ]);

  assert.equal(data.length, 2);
});

test("merges across venue-name drift at the same minute", () => {
  const { data } = mergeShows(
    [show("tm", "2026-09-20T20:00:00", "The Danforth Music Hall", "The Charlatans UK")],
    [show("agg", "2026-09-20T20:00:00", "Danforth Music Hall", "The Charlatans")],
  );

  assert.equal(data.length, 1);
});

test("keeps the same act a day apart", () => {
  const { data } = mergeShows([
    show("day1", "2026-09-20T19:00:00", "Sound Garage", "Point"),
    show("day2", "2026-09-21T19:00:00", "Sound Garage", "Point"),
  ]);

  assert.equal(data.length, 2);
});

test("records the other source's spelling as an alias", () => {
  const { data } = mergeShows(
    [show("tm", "2026-09-20T19:30:00", "The Dance Cave", "MATRAKK (Free Before Midnight)")],
    [show("agg", "2026-09-20T19:30:00", "The Dance Cave", "Matrakk")],
  );

  assert.equal(data.length, 1);
  assert.equal(data[0].performers.length, 1, "one act, not two");
  assert.deepEqual(data[0].performers[0].aliases, ["Matrakk"]);
});

test("keeps a distinct support act while collapsing a re-spelt headliner", () => {
  const { data } = mergeShows(
    [show("tm", "2026-09-20T19:00:00", "Danforth", "The Charlatans UK", "Frankie Rose")],
    [show("agg", "2026-09-20T19:00:00", "Danforth", "The Charlatans")],
  );

  assert.deepEqual(
    data[0].performers.map((performer) => performer.name),
    ["The Charlatans UK", "Frankie Rose"],
  );
});

test("leaves a single provider's bill untouched", () => {
  const { data } = mergeShows([
    show(
      "agg",
      "2026-09-20T19:00:00",
      "V",
      "Dean Brody & The Reklaws",
      "Dean Brody",
      "The Reklaws",
    ),
  ]);

  assert.equal(data[0].performers.length, 3, "The Reklaws is its own act");
});

test("prefers the first source when both describe one show", () => {
  const { data } = mergeShows(
    [{ ...show("tm", "2026-09-20T20:00:00", "V", "Act"), ticketUrl: "https://ticketmaster" }],
    [{ ...show("agg", "2026-09-20T20:00:00", "V", "Act"), ticketUrl: "https://aggregator" }],
  );

  assert.equal(data[0].id, "tm");
  assert.equal(data[0].ticketUrl, "https://ticketmaster");
});

test("orders located shows before unplottable ones", () => {
  const located = show("located", "2026-09-21T19:00:00", "V", "Act");
  const unplottable: Show = {
    ...show("unplottable", "2026-09-20T19:00:00", "V", "Other Act"),
    venue: { name: "V", url: "", city: "", latitude: null, longitude: null },
  };

  const { data } = mergeShows([unplottable, located]);

  assert.deepEqual(data.map((entry) => entry.id), ["located", "unplottable"]);
});
