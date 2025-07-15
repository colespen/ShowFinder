const filterCurrentAddress = (currentAddress) => {
  return currentAddress.address.country
    ? currentAddress.address.city + ", " + currentAddress.address.country
    : currentAddress.address.city;
};

module.exports = filterCurrentAddress;
