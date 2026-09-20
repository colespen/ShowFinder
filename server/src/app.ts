import cors from "cors";
import express from "express";
import type { Express } from "express";
import morgan from "morgan";

import { env } from "./config/env.ts";
import { errorHandler } from "./middleware/error.ts";
import { healthRouter } from "./routes/health.ts";
import { showsRouter } from "./routes/shows.ts";
import { spotifyRouter } from "./routes/spotify.ts";

export function createApp(): Express {
  const app = express();

  // Express 5 defaults to the "simple" query parser, which would leave the
  // client's nested `dateRange[minDate]` param unparsed and silently widen every
  // request back to today. "extended" keeps the Express 4 behaviour.
  app.set("query parser", "extended");

  app.use(cors({ origin: env.corsOrigin, optionsSuccessStatus: 200 }));
  app.use(morgan("tiny"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(healthRouter);
  app.use(showsRouter);
  app.use(spotifyRouter);

  app.use(errorHandler);

  return app;
}
