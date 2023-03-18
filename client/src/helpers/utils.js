// filter city name before comma for currCity
const cityFilter = (str) => {
  const regex = new RegExp(/,/gm);
  const upperStr =
    str.toLowerCase().split(' ').map(el => el[0].toUpperCase() + el.substring(1)).join(' ');
  if (!regex.test(str)) return upperStr;

  const index = str.indexOf(',');
  return upperStr.substring(0, index);
};

export { cityFilter };