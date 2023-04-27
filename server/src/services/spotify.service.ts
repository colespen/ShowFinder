import axios, { AxiosError } from 'axios';
import ENV from '../environment.js';
import Debug from 'debug';
import moment, { Moment } from 'moment';

const debug = Debug('sf-api:service:spotify');

class SpotifyService {

  accessToken?: string;
  accessTokenExpiration?: Moment;

  constructor() {}

  private _validateAccessToken(): boolean {
    if (!this.accessTokenExpiration) return false;
    return moment.utc().isBefore(this.accessTokenExpiration);
  }

  private async _getAccessToken() {
    const now = moment.utc().format('YYYY-MM-DD HH:mm');
    debug(`_getAccessToken: ${now} ${this.accessTokenExpiration?.format('YYYY-MM-DD HH:mm')}`);

    const b64AuthToken = Buffer.from(ENV.SPOTIFY_ID + ':' + ENV.SPOTIFY_SECRET).toString('base64');
    try {
      const response = await axios.post(
        'https://accounts.spotify.com/api/token',
        { grant_type: 'client_credentials' },
        {
          headers: {
            Authorization: `Basic ${b64AuthToken}`,
            "Content-Type": 'application/x-www-form-urlencoded'
          },
        },
      );

      this.accessToken = response.data.access_token;
      this.accessTokenExpiration = moment.utc().add(response.data.expires_in - 60, 'second');

    } catch (e) {
      debug('spotify-authorisation-error');
      throw Error('spotify-authorisation-error');
    }
  }

  async getArtistSample(id: string, market: string) {
    if (!this._validateAccessToken()) await this._getAccessToken();
    const params = new URLSearchParams({
      market: market,
      format: 'json'
    });
    try {
      const response = await axios.get(
        `https://api.spotify.com/v1/artists/${id}/top-tracks?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          }
        }
      );
      return response.data.tracks;
    } catch(e) {
      debug('spotify-artist-sample-error');
      throw Error('spotify-artist-sample-error');
    }
  }

  async findArtist(searchTerm: string) {
    if (!this._validateAccessToken()) await this._getAccessToken();
    const params = new URLSearchParams({
      q: searchTerm,
      type: 'artist',
    });
    try {
      const response = await axios.get(
        `https://api.spotify.com/v1/search?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          }
        }
      );
      return response.data.artists;
    } catch (e: any) {
      debug('spotify-artist-search-error');
      throw Error('spotify-artist-search-error');
    }
  }

}

export default SpotifyService;
