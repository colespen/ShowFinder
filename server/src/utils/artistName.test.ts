import assert from "node:assert/strict";
import { test } from "node:test";

import { isSameAct, normalizeArtist } from "./artistName.ts";

test("folds diacritics so accented and plain spellings match", () => {
  assert.equal(normalizeArtist("Sébastien Tellier"), normalizeArtist("Sebastien Tellier"));
});

test("transliterates Latin letters NFD cannot decompose", () => {
  assert.equal(normalizeArtist("Altın Gün"), "altin gun");
  assert.equal(normalizeArtist("Mø"), "mo");
  assert.equal(normalizeArtist("Sigur Rós"), "sigur ros");
});

test("ignores case, punctuation and a leading article", () => {
  assert.equal(normalizeArtist("The Charlatans UK"), "charlatans uk");
  assert.equal(normalizeArtist("  BIG  SPECIAL "), "big special");
});

test("treats a whole-word superset as the same act", () => {
  assert.equal(isSameAct("charlatans uk", "charlatans"), true);
  assert.equal(isSameAct("ben harper", "ben harper the innocent criminals"), true);
});

test("does not treat unrelated names as the same act", () => {
  assert.equal(isSameAct("peaches", "elder"), false);
  assert.equal(isSameAct("", "anything"), false);
});
