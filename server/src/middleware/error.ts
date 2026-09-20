import axios from "axios";
import type { NextFunction, Request, Response } from "express";

import type { ApiErrorBody } from "../types/api.ts";
import { describeError } from "../utils/errors.ts";

export function sendError(
  res: Response<ApiErrorBody>,
  error: unknown,
  fallbackStatus = 500,
): void {
  const upstream = axios.isAxiosError(error) ? error.response?.status : undefined;
  const url = axios.isAxiosError(error) ? (error.config?.url ?? "") : "";
  const message = describeError(error);

  console.error("Error:", message, upstream ? `(upstream ${upstream})` : "", url);
  res.status(fallbackStatus).json({ error: message, upstreamStatus: upstream ?? null });
}

/**
 * Express 5 forwards a rejected promise from a route here on its own, so routes
 * carry no error handling of their own. Validation failures answer directly,
 * since they are normal control flow rather than errors.
 */
export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response<ApiErrorBody>,
  _next: NextFunction,
): void {
  sendError(res, error);
}
