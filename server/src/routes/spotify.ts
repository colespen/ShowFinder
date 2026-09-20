import { Router } from "express";
import type { Response } from "express";

import * as spotify from "../services/spotify.ts";
import type { ApiErrorBody, SpotifySampleResponse } from "../types/api.ts";

export const spotifyRouter = Router();

// Kept so existing clients can warm the token on load; the server refreshes it on
// its own, so this is no longer required for previews to work.
spotifyRouter.post("/api/spotifyauth", async (_req, res) => {
  await spotify.getToken();
  res.sendStatus(200);
});

/**
 * Resolves the headliner to a Spotify artist and returns its top tracks.
 * `aliases` carries the other provider's spelling of the same act (pipe
 * separated), which is what rescues names like a Ticketmaster tour title.
 */
spotifyRouter.get(
  "/api/spotifysample",
  async (req, res: Response<SpotifySampleResponse | ApiErrorBody>) => {
    const aliases = String(req.query.aliases ?? "")
      .split("|")
      .map((alias) => alias.trim())
      .filter(Boolean);
    const artistName = typeof req.query.artist === "string" ? req.query.artist : undefined;
    const { artist, tracks } = await spotify.findArtistPreview(artistName, aliases);

    res.json({ artist, tracks });
  },
);
