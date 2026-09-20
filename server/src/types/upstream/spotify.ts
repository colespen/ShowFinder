export interface SpotifyTokenResponse {
  access_token: string;
  expires_in?: number;
}

export interface SpotifyArtistItem {
  id: string;
  name: string;
  external_urls?: { spotify?: string };
}

export interface SpotifyArtistSearchResponse {
  artists?: { items?: SpotifyArtistItem[] };
}

export interface SpotifyTopTracksResponse {
  tracks?: SpotifyTrackItem[];
}

export interface SpotifyTrackItem {
  id: string;
  name: string;
  /**
   * Always null for this app's credentials, so it is filled in from the public
   * embed page instead.
   */
  preview_url?: string | null;
}

/** Shape of the `__NEXT_DATA__` blob served by open.spotify.com/embed/track. */
export interface SpotifyEmbedResponse {
  props?: {
    pageProps?: {
      state?: { data?: { entity?: { audioPreview?: { url?: string } } } };
    };
  };
}
