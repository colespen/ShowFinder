// filter city name before comma for currCity
const cityFilter = (str) => {
  const regex = new RegExp(/,/gm);
  const upperChar = str[0].toUpperCase();
  if (!regex.test(str)) return upperChar + str.substring(1);

  const index = str.indexOf(',');
  return upperChar + str.substring(1, index);
};

export { cityFilter };