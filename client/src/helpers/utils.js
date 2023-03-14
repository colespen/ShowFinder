// filter city name before comma for currCity
const cityFilter = (str) => {
  const regex = new RegExp(/,/gm);
  if (!regex.test(str)) return str;
  const index = str.indexOf(',');
  return str.substring(0, index);
};

export { cityFilter };