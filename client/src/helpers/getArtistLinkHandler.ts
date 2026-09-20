/**
 * Open Ticketmaster ticket URL in a new tab.
 */
export default async function getArtistTickets(ticketUrl?: string) {
  if (!ticketUrl) return;
  window.open(ticketUrl, "_blank", "noreferrer");
}

export const handleXternalMusicLink = (url: string) => {
  if (!url) return;
  window.open(url, "_blank", "noreferrer");
};
