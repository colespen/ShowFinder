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
