import assert from "node:assert/strict";
import { test } from "node:test";

import type { SpotifyArtistItem } from "../types/upstream/spotify.ts";
import { pickArtist } from "./spotify.ts";

const candidate = (name: string, id: string): SpotifyArtistItem => ({
  id,
  name,
  external_urls: { spotify: `https://open.spotify.com/artist/${id}` },
});

test("prefers an exact name over a longer candidate", () => {
  const picked = pickArtist(
    [candidate("The Charlatans UK", "x"), candidate("The Charlatans", "y")],
    "The Charlatans",
  );

  assert.equal(picked?.id, "y");
});

test("accepts a candidate that opens the term", () => {
  assert.equal(
    pickArtist([candidate("MATRAKK", "m")], "MATRAKK (Free Before Midnight)")?.id,
    "m",
  );
  assert.equal(
    pickArtist([candidate("Born Without Bones", "b")], "Born Without Bones W/ Stalefish")?.id,
    "b",
  );
});

test("prefers the longer of two matching prefixes", () => {
  const picked = pickArtist(
    [candidate("Born", "short"), candidate("Born Without Bones", "long")],
    "Born Without Bones W/ Stalefish",
  );

  assert.equal(picked?.id, "long", "the more specific act wins");
});

test("rejects a candidate found part-way through the term", () => {
  assert.equal(pickArtist([candidate("AC/DC", "a")], "Who Made Who / AC/DC Tribute"), null);
  assert.equal(
    pickArtist([candidate("Elmo", "e")], "Higgi at the Elmo - A Live Recording Event"),
    null,
  );
});

test("rejects a short term matching a longer artist", () => {
  assert.equal(pickArtist([candidate("Jimi Hendrix", "j")], "Jimi"), null);
});

test("resolves nothing rather than something wrong", () => {
  assert.equal(
    pickArtist([candidate("K'NAAN", "k")], "Sunday Songwriter Open Mic Every Week"),
    null,
  );
  assert.equal(pickArtist([], "Anything"), null);
});

test("carries the artist link through", () => {
  assert.equal(
    pickArtist([candidate("Pop Evil", "pe")], "Pop Evil")?.spotifyUrl,
    "https://open.spotify.com/artist/pe",
  );
});
