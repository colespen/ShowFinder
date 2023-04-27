import express from 'express';
import Debug from 'debug';
import SpotifyService from '../services/spotify.service.js';
import createError from 'http-errors';

const debug = Debug('sf-api:route:spotfiy');
const router = express.Router();

router.get('/artist-sample/:artistid/:country', async (req, res, next) => {
  try {
    const spotfiy = new SpotifyService();
    const response = await spotfiy.getArtistSample(req.params.artistid, req.params.country);
    res.send(response);
  } catch(e) {
    next(createError(500));
  }
});

router.get('/search/artist', async (req, res, next) => {
  try {
    const searchTerm: string = (req.query.q as string);
    debug(searchTerm);

    const spotfiy = new SpotifyService();
    const response = await spotfiy.findArtist(searchTerm);
    res.send(response);
  } catch (e) {
    next(createError(500));
  }
});

export { router };