//////    Artist Name Open Link - async
export default async function getArtist(
  e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>,
  venue: string
) {
  try {
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });
    const artistVenueName: string = handleArtistName(e, venue);
    handleArtistLink(artistVenueName);
    
  } catch (err: unknown) {
    console.error((err as Error).message);
  }
}

//////    Set artist name onClick
const handleArtistName = (
  e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>,
  venue: string
) => {
  const target = e.target as HTMLButtonElement;
  const artistVenue = target.innerText + " " + venue;
  return artistVenue.split(" ").join("+");
};

//////    Open artist name onClick
const handleArtistLink = (artistVenueName: string) => {
  window.open(
    `https://www.songkick.com/search?utf8=&type=initial&query=
      ${artistVenueName}&commit=`,
    "_blank",
    "noreferrer"
  );
};

export const handleXternalMusicLink = (url: string) => {
  window.open(
    url,
    "_blank",
    "noreferrer"
  );
}
