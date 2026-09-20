/**
 * Legacy event de-duplication, retained for future use.
 *
 * NOT currently wired up. The active pipeline
 * (`services/rapidapi.js` -> `mappers/rapidShowMapper.js`) de-duplicates on
 * RapidAPI's stable `concert_id`, which is more reliable than matching on
 * free-text `description`. This version remains useful if a future source
 * only exposes artist/venue text without a unique event id.
 *
 * Note: `eventNameFilter` splits on the first "at", so descriptions that
 * contain "at" inside a word can collapse two distinct events.
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
