/**
 * Extracts the leading event name from a Songkick description, e.g.
 * "Isaiah Rashad and Alemeda at Emo's Austin at 2026-..." -> "Isaiah Rashad and Alemeda".
 *
 * Used only by ./dedupe.js (currently unwired). Splits on the first "at",
 * so names containing "at" as a substring truncate early.
 */
const eventNameFilter = (description) => {
  if (description) {
    const indexOfAt = description.indexOf("at");
    const eventName = description.substring(0, indexOfAt);
    return eventName;
  } else {
    return;
  }
};

module.exports = eventNameFilter;
