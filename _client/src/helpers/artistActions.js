//////    Artist Name -> Link async
export default async function getArtist(e) {
  try {
    await new Promise(resolve => {
      setTimeout(resolve, 0);
    });
    const artistName = handleArtistName(e);
    handleArtistLink(artistName);

  } catch (err) {
    return console.error(err.message);
  }
};

//////    Set artist name onClick
const handleArtistName = e => {
  return (e.target.innerText).split(' ').join('+');
};

//////    Open artist name onClick
const handleArtistLink = (artist) => {
  window.open(
    `https://www.songkick.com/search?utf8=%E2%9C%93&type=initial&query=
      ${artist}&commit=`, '_blank', 'noreferrer'
  );
};