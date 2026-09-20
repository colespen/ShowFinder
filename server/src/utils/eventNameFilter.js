/** Leading event name from a Songkick description
 * ("X and Y at Venue at 2026-..." -> "X and Y"). Used only by ./dedupe.js;
 * splits on the first "at", so names containing "at" truncate early. */
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
