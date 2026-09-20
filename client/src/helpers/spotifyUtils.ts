export interface SpotifyArtist {
  id: string;
  name: string;
  spotifyUrl: string;
}

interface ApplySpotifyResultArgs {
  artist: SpotifyArtist | null;
  tracks: any[];
  setAudioLink: (state: string) => void;
  setIsPlaying: (state: boolean) => void;
  setSpotifyUrl: (state: string) => void;
  setNowPlaying: (state: string) => void;
}

/**
 * Applies the server's Spotify resolution to the player.
 *
 * The server resolves the artist from the headliner plus any aliases the other
 * event source supplied, so there is no name matching left to do here: an act it
 * could not identify confidently simply has no link, which beats linking to
 * whichever artist the client guessed from a partial name.
 */
const applySpotifyResult = ({
  artist,
  tracks,
  setAudioLink,
  setIsPlaying,
  setSpotifyUrl,
  setNowPlaying,
}: ApplySpotifyResultArgs) => {
  setSpotifyUrl(artist?.spotifyUrl || "");

  const playable = (tracks || []).find((track) => track?.preview_url);
  if (!playable) {
    setAudioLink("");
    setIsPlaying(false);
    return;
  }
  setAudioLink(playable.preview_url);
  setNowPlaying(playable.name);
};

export { applySpotifyResult };
