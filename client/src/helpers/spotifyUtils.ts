interface matchArtistSetAudioPlayingArgs {
  tracks: any[];
  artist: string;
  setAudioLink: (state: string) => void;
  setIsPlaying: (state: boolean) => void;
  setSpotifyUrl: (state: string) => void;
}

interface SpotifyTracksParams {
  name: string;
  [key: string]: any;
}

const matchArtistSetAudioPlaying = ({
  tracks,
  artist,
  setAudioLink,
  setIsPlaying,
  setSpotifyUrl,
}: matchArtistSetAudioPlayingArgs) => {
  if (tracks.length === 0) {
    setAudioLink("");
    setSpotifyUrl("");
    throw new Error("No tracks found");
  }
  let foundPreview = false;
  let foundUrl = false;
  // take first preview_url and external_url that isn't null then exit
  for (let i = 0; i < tracks.length; i++) {
    let matchIndex = 0;
    const isArtistFound = tracks[i].artists.some(
      (artistEl: SpotifyTracksParams, index: number) => {
        const stripSpotArtist = stripDiacriticalMarks(artistEl.name);
        const stripRapidArist = stripDiacriticalMarks(artist);
        if (
          // TODO: compare so at least two words match (not just one)
          stripSpotArtist.toUpperCase().includes(stripRapidArist.toUpperCase())
        ) {
          matchIndex = index;
          return true;
        } else {
          return false;
        }
      }
    );
    if (!foundPreview && tracks[i].preview_url && isArtistFound) {
      setAudioLink(tracks[i].preview_url);
      // setIsPlaying(false);
      foundPreview = true;
    }
    if (
      !foundUrl &&
      matchIndex !== -1 &&
      tracks[i].artists[matchIndex].external_urls.spotify &&
      isArtistFound
    ) {
      setSpotifyUrl(tracks[i].artists[matchIndex].external_urls.spotify);
      foundUrl = true;
    }
    if (foundPreview && foundUrl) break;
  }

  if (!foundPreview) {
    setAudioLink("");
    setIsPlaying(false); // TODO : this doesnt work to use play/pause if no audio preview found 
  }
  if (!foundUrl) {
    setSpotifyUrl("");
  }
  return;
};

export { matchArtistSetAudioPlaying };

const stripDiacriticalMarks = (str: string) => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace("&", "And");
  //   .replace(/[\u0300-\u036f]/g, "")
  //   .replace(/[\u1AB0-\u1AFF]/g, "")
  //   .replace(/[\u1DC0-\u1DFF]/g, "")
  //   .replace(/[\u20D0-\u20FF]/g, "")
  //   .replace(/[\uFE20-\uFE2F]/g, "");
};
