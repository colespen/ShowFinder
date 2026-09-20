/**
 * Name rules shared by cross-provider event matching and Spotify artist
 * resolution. Both need to decide whether two spellings are the same act, so the
 * comparison lives here rather than being reimplemented per caller.
 */

// Latin letters NFD cannot decompose, so a provider using the ASCII spelling
// ("Altin Gun") still matches one using the native form.
const TRANSLITERATE = {
  "ı": "i", "ł": "l", "ø": "o", "đ": "d", "ð": "d",
  "þ": "th", "æ": "ae", "œ": "oe", "ß": "ss", "ħ": "h", "ŧ": "t",
};

/**
 * Lowercases and strips punctuation/articles so name formats can be compared.
 * Diacritics are folded first, or "Sébastien Tellier" would lose the "é" to the
 * punctuation strip and stop matching the provider that spells it without one.
 */
function normalizeArtist(name) {
  return String(name || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[ıłøđðþæœßħŧ]/g, (char) => TRANSLITERATE[char] || char)
    .toLowerCase()
    .replace(/\bthe\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * True when both names refer to one act: either form contains the other as a
 * whole-word run. Catches "The Charlatans"/"The Charlatans UK" and frontman vs
 * band ("Ben Harper"/"Ben Harper & The Innocent Criminals"), which exact
 * comparison misses.
 *
 * Accepted trade-off: two genuinely different acts where one name is a subset
 * of the other ("Jet" and "Jet Black") collapse onto whichever the preferred
 * list names. That ran about 1 case in 35 across Toronto, Austin and New York,
 * and the cost is one missing name on an otherwise correct event - cheaper than
 * showing the same act twice.
 */
function isSameAct(a, b) {
  if (!a || !b) return false;
  if (a === b) return true;
  const [shorter, longer] = a.length <= b.length ? [a, b] : [b, a];
  return ` ${longer} `.includes(` ${shorter} `);
}

module.exports = { normalizeArtist, isSameAct, TRANSLITERATE };
