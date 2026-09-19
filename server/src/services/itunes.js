const axios = require("axios");

const cache = new Map();
const CACHE_TTL_MS = 60 * 60 * 1000;

function stripDiacriticalMarks(str = "") {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "And")
    .toUpperCase()
    .trim();
}

function cacheKey(artist) {
  return stripDiacriticalMarks(artist);
}

function getCached(artist) {
  const entry = cache.get(cacheKey(artist));
  if (!entry) return null;
  if (Date.now() - entry.cachedAt > CACHE_TTL_MS) {
    cache.delete(cacheKey(artist));
    return null;
  }
  return entry.value;
}

function setCached(artist, value) {
  cache.set(cacheKey(artist), { value, cachedAt: Date.now() });
}

function matchTrack(results, artist) {
  const query = stripDiacriticalMarks(artist);
  const withPreview = results.filter((track) => track.previewUrl);
  const namedMatch = withPreview.find((track) => {
    const name = stripDiacriticalMarks(track.artistName || "");
    return name.includes(query) || query.includes(name);
  });
  return namedMatch || withPreview[0] || null;
}

async function searchArtistPreview(artist) {
  const term = String(artist || "").trim();
  if (!term) {
    return { previewUrl: "", trackName: "", artistName: "", artworkUrl: "", itunesUrl: "" };
  }

  const cached = getCached(term);
  if (cached) return cached;

  const params = new URLSearchParams({
    term,
    media: "music",
    entity: "song",
    limit: "5",
  });

  const response = await axios.get(
    `https://itunes.apple.com/search?${params.toString()}`,
    { timeout: 10000 },
  );

  const results = Array.isArray(response.data?.results) ? response.data.results : [];
  const track = matchTrack(results, term);
  const value = {
    previewUrl: track?.previewUrl || "",
    trackName: track?.trackName || "",
    artistName: track?.artistName || term,
    artworkUrl: track?.artworkUrl100 || "",
    itunesUrl: track?.trackViewUrl || "",
  };

  setCached(term, value);
  return value;
}

module.exports = { searchArtistPreview };
