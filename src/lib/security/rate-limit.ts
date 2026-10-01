type Bucket = { count: number; resetAt: number };

/**
 * Fixed-window failure counter held in process memory. On serverless hosts each
 * instance keeps its own counts, so this is best-effort throttling, not a hard
 * guarantee; use a shared store (Redis/Upstash) for strict limits.
 */
export function createRateLimiter(limit: number, windowMs: number) {
  const buckets = new Map<string, Bucket>();

  const prune = (now: number) => {
    if (buckets.size < 5000) return;
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(key);
    }
  };

  const record = (key: string, now = Date.now()) => {
    prune(now);
    const bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
    } else {
      bucket.count += 1;
    }
  };

  return {
    /** Seconds until the key may try again, or 0 if it is not blocked. */
    retryAfter(key: string, now = Date.now()): number {
      const bucket = buckets.get(key);
      if (!bucket || bucket.resetAt <= now || bucket.count < limit) return 0;
      return Math.ceil((bucket.resetAt - now) / 1000);
    },
    /** Counts one attempt against `key` (use for failures, or for every request). */
    recordFailure: record,
    record,
    reset(key: string) {
      buckets.delete(key);
    },
  };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}
