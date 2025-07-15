
//////    Artist Name -> Link async
export default async function getArtist(e, venue) {
  try {
    await new Promise(resolve => {
      setTimeout(resolve, 0);
    });
    const artistVenueName = handleArtistVenueName(e, venue);
    handleArtistLink(artistVenueName);

  } catch (err) {
    return console.error(err.message);
  }
};

//////    Set artist name onClick
const handleArtistVenueName = (e, venue) => {
  const artistVenue = e.target.innerText + " " + venue;
  return artistVenue.split(' ').join('+');
};

//////    Open artist name onClick
const handleArtistLink = (artistVenueName) => {
  window.open(
    `https://www.songkick.com/search?utf8=&type=initial&query=
      ${artistVenueName}&commit=`, '_blank', 'noreferrer'
  );
};