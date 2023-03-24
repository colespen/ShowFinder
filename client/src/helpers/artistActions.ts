//////    Artist Name Open Link - async
export default async function getArtist(
  e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>
) {
  try {
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });
    const artistName: string = handleArtistName(e);
    handleArtistLink(artistName);
  } catch (err: unknown) {
    console.error((err as Error).message);
  }
}

//////    Set artist name onClick
const handleArtistName = (
  e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>
) => {
  return (e.target as HTMLButtonElement).innerText.split(" ").join("+");
};

//////    Open artist name onClick
const handleArtistLink = (artist: string) => {
  window.open(
    `https://www.songkick.com/search?utf8=%E2%9C%93&type=initial&query=
      ${artist}&commit=`,
    "_blank",
    "noreferrer"
  );
};
