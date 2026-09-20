/**
 * Legacy dedupe, kept for reuse but currently unwired: the live pipeline
 * (services/rapidapi -> mappers/rapidShowMapper) de-dupes on concert_id.
 * Only useful if a future source exposes no unique event id.
 *
 * Caveat: eventNameFilter splits on the first "at", so descriptions
 * containing "at" inside a word can collapse distinct events.
 */
const eventNameFilter = require("./eventNameFilter");

const dedupe = (response) => {
  const deduped =
    response?.data?.data?.filter((el, index, arr) => {
      const eventNameA = eventNameFilter(el.description);
      return (
        index ===
        arr.findIndex((x) => {
          const eventNameB = eventNameFilter(x.description);
          return eventNameB === eventNameA;
        })
      );
    }) || [];
  return deduped;
};

module.exports = dedupe;
