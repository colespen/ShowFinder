/**
 * handle artist and venue name and open songkick link - async
 *  */
export default async function getArtistTickets(
  // e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>,
  artistName: string,
  venue: string,
) {
  try {
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });
    const artistVenueName: string = handleArtistName(artistName, venue);
    handleArtistLink(artistVenueName);
  } catch (err: unknown) {
    console.error((err as Error).message);
  }
}

//////    Set artist name onClick
const handleArtistName = (
  // e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>,
  artistName: string,
  venue: string,
) => {
  // const target = e.target as HTMLButtonElement;
  // const artistVenue = target.innerText + " " + venue;
  const artistVenue = artistName + " " + venue;
  return artistVenue.split(" ").join("+");
};

//////    Open artist name onClick
const handleArtistLink = (artistPlusVenueName: string) => {
  if (!artistPlusVenueName) {
    return;
  }
  window.open(
    `https://www.songkick.com/search?utf8=&type=initial&query=
      ${artistPlusVenueName}&type=upcoming`,
    "_blank",
    "noreferrer",
  );
};

export const handleXternalMusicLink = (url: string) => {
  if (!url) return;
  window.open(url, "_blank", "noreferrer");
};
