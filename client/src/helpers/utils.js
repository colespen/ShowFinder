// filter city name before comma for currCity
const cityFilter = (str) => {
  const regex = new RegExp(/,/gm);
  const upperStr =
    str.toLowerCase().split(' ').map(el => el[0].toUpperCase() + el.substring(1)).join(' ');
  if (!regex.test(str)) return upperStr;

  const index = str.indexOf(',');
  return upperStr.substring(0, index);
};

// Only display spinner if new marker (artist) and to hide initial "audio unavailable"
const handleSetNewAudio = (setNewAudio, audioLink) => {
  setNewAudio(false);
  setTimeout(() => {
    if (!audioLink) {
      setNewAudio(true);
    }
  }, 500);
};

const handlePlayPause = (audioLink, isPlaying, audioRef) => {
  if (audioLink) {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  }
};

export { cityFilter, handlePlayPause, handleSetNewAudio };