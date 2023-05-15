interface matchArtistSetAudioPlayingArgs {
  tracks: any[];
  artist: string;
  setAudioLink: (state: string) => void;
  setIsPlaying: (state: boolean) => void;
  setSpotifyUrl: (state: string) => void;
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
    // setSpotifyUrl("")
    throw new Error("No tracks found");
  }

  let foundPreview = false;
  let foundUrl = false;
  // take first preview_url and external_url that isn't null then exit
  for (let i = 0; i < tracks.length; i++) {
    const isArtistFound = tracks[i].artists.some(
      (artistEl: { name: string }) => {
        const stripSpotArtist = stripDiacriticalMarks(artistEl.name);
        const stripRapidArist = stripDiacriticalMarks(artist);
        return stripRapidArist
          .toUpperCase()
          .includes(stripSpotArtist.toUpperCase());
      }
    );
    if (!foundPreview && tracks[i].preview_url && isArtistFound) {
      setAudioLink(tracks[i].preview_url);
      setIsPlaying(false);
      foundPreview = true;
    }
    if (
      !foundUrl &&
      tracks[i].artists[0].external_urls.spotify &&
      isArtistFound
    ) {
      setSpotifyUrl(tracks[i].artists[0].external_urls.spotify);
      foundUrl = true;
    }
    if (foundPreview && foundUrl) break;
  }
  if (!foundPreview) {
    setAudioLink("");
    setIsPlaying(false);
  }
  if (!foundUrl) {
    setSpotifyUrl("");
  }
  return;
};
export { matchArtistSetAudioPlaying };

const stripDiacriticalMarks = (str: string) => {
  return str.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  // .replace(/[\u0300-\u036f]/g, "")
  // .replace(/[\u1AB0-\u1AFF]/g, "")
  // .replace(/[\u1DC0-\u1DFF]/g, "")
  // .replace(/[\u20D0-\u20FF]/g, "")
  // .replace(/[\uFE20-\uFE2F]/g, "");
};
