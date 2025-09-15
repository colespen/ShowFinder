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
