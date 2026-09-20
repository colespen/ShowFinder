/**
 * Extracts the leading event name from a Songkick-style description such as
 * "Isaiah Rashad and Alemeda at Emo's Austin at 2026-09-19T19:00:00-0500".
 *
 * Used only by `./dedupe.js`, which is currently unwired (see that file).
 * Splits on the first "at", so a name containing "at" as a substring
 * (e.g. "Spätfest") truncates early — acceptable for its legacy purpose,
 * but not a reason to prefer it over matching on a unique event id.
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
