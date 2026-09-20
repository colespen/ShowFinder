/**
 * The aggregator answers HTTP 200 with an `error` field when it cannot resolve a
 * place name, and that is deterministic - callers widen the query instead of
 * retrying it.
 */
export class UpstreamLocationError extends Error {
  readonly upstreamInvalidLocation = true;
}
