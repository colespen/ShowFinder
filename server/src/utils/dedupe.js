/** Legacy dedupe, unwired: the live pipeline de-dupes on concert_id. Kept for a
 * source that exposes no unique event id. Caveat: eventNameFilter splits on the
 * first "at", so a name containing "at" can collapse distinct events. */
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
