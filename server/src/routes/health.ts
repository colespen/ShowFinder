import { Router } from "express";
import type { Response } from "express";

import { configuredUpstreams, missingRequiredUpstreams } from "../config/env.ts";
import type { HealthResponse } from "../types/api.ts";

export const healthRouter = Router();

healthRouter.get("/", (_req, res: Response<{ message: string; status: string }>) => {
  res.json({ message: "ShowFinder API is running", status: "healthy" });
});

// Reports which upstreams are configured (booleans only, never values), so a
// deploy can be verified in one request. Spotify and Ticketmaster only enrich
// results, so neither blocks readiness.
healthRouter.get("/api/health", (_req, res: Response<HealthResponse>) => {
  const missing = missingRequiredUpstreams();
  const ready = missing.length === 0;

  res.status(ready ? 200 : 503).json({
    status: ready ? "healthy" : "misconfigured",
    ready,
    configured: configuredUpstreams(),
    missing,
  });
});
