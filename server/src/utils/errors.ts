/**
 * The aggregator answers HTTP 200 with an `error` field when it cannot resolve a
 * place name, and that is deterministic - callers widen the query instead of
 * retrying it.
 */
export class UpstreamLocationError extends Error {
  readonly upstreamInvalidLocation = true;
}

/** Message from an unknown throwable, for logging. */
export function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
