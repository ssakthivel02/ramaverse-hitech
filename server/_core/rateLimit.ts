/**
 * In-memory fixed-window protection for public tRPC queries.
 *
 * Bounded state and fail-closed saturation avoid an unbounded memory sink.
 * This is PER-PROCESS defense only: production with multiple instances needs
 * a trusted-proxy policy and shared/distributed limiter before release.
 */
export type RateLimitResult =
  | { allowed: true; remaining: number }
  | { allowed: false; retryAfterSeconds: number };

export function createFixedWindowLimiter(options: {
  maxRequests: number;
  windowMs: number;
  maxEntries: number;
  now?: () => number;
}) {
  const { maxRequests, windowMs, maxEntries, now = Date.now } = options;
  for (const value of [maxRequests, windowMs, maxEntries]) {
    if (!Number.isSafeInteger(value) || value <= 0) {
      throw new Error("Rate limiter configuration must use positive safe integers");
    }
  }
  const buckets = new Map<string, { count: number; resetAt: number }>();
  const retrySeconds = (remainingMs: number) => Math.max(1, Math.ceil(remainingMs / 1000));

  function consume(key: string): RateLimitResult {
    const time = now();
    if (!Number.isFinite(time) || !key) {
      return { allowed: false, retryAfterSeconds: retrySeconds(windowMs) };
    }
    let entry = buckets.get(key);
    if (entry && time >= entry.resetAt) {
      buckets.delete(key);
      entry = undefined;
    }
    if (!entry) {
      if (buckets.size >= maxEntries) {
        buckets.forEach((item, itemKey) => {
          if (time >= item.resetAt) buckets.delete(itemKey);
        });
      }
      // Never evict a live key to make space for a flood of new keys.
      if (buckets.size >= maxEntries) {
        return { allowed: false, retryAfterSeconds: retrySeconds(windowMs) };
      }
      entry = { count: 0, resetAt: time + windowMs };
      buckets.set(key, entry);
    }
    if (entry.count >= maxRequests) {
      return { allowed: false, retryAfterSeconds: retrySeconds(entry.resetAt - time) };
    }
    entry.count++;
    return { allowed: true, remaining: maxRequests - entry.count };
  }
  return { consume, size: () => buckets.size };
}
