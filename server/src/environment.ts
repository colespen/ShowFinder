import dotenv from 'dotenv';
dotenv.config();

if (!process.env.PORT) {
  throw new Error('misconfigured environment PORT');
}
if (!process.env.DB_HOST) {
  throw new Error('misconfigured environment DB_HOST');
}
if (!process.env.DB_PORT) {
  throw new Error('misconfigured environment DB_PORT');
}
if (!process.env.DB_NAME) {
  throw new Error('misconfigured environment DB_NAME');
}
if (!process.env.LOCATION_IQ_TOKEN) {
  throw new Error('misconfigured environment LOCATION_IQ_TOKEN');
}
if (!process.env.TICKERMASTER_KEY) {
  throw new Error('misconfigured environment TICKERMASTER_KEY');
}
if (!process.env.SPOTIFY_ID) {
  throw new Error('misconfigured environment SPOTIFY_ID');
}
if (!process.env.SPOTIFY_SECRET) {
  throw new Error('misconfigured environment SPOTIFY_SECRET');
}

const ENV = {
  PORT: process.env.PORT,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_NAME: process.env.DB_NAME,
  LOCATION_IQ_TOKEN: process.env.LOCATION_IQ_TOKEN,
  TICKERMASTER_KEY: process.env.TICKERMASTER_KEY,
  SPOTIFY_ID: process.env.SPOTIFY_ID,
  SPOTIFY_SECRET: process.env.SPOTIFY_SECRET,
};

export default ENV;
