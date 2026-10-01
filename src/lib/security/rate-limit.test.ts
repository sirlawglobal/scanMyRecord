import { describe, expect, it } from "vitest";
import { createRateLimiter } from "./rate-limit";

describe("rate limiter", () => {
  it("blocks a key after the limit and releases it after the window", () => {
    const limiter = createRateLimiter(3, 1000);

    for (let i = 0; i < 3; i += 1) limiter.recordFailure("k", 0);

    expect(limiter.retryAfter("k", 500)).toBe(1);
    expect(limiter.retryAfter("k", 1001)).toBe(0);
    expect(limiter.retryAfter("other", 500)).toBe(0);
  });

  it("does not block below the limit and resets on success", () => {
    const limiter = createRateLimiter(3, 1000);
    limiter.recordFailure("k", 0);
    limiter.recordFailure("k", 0);
    expect(limiter.retryAfter("k", 1)).toBe(0);

    limiter.recordFailure("k", 0);
    expect(limiter.retryAfter("k", 1)).toBeGreaterThan(0);

    limiter.reset("k");
    expect(limiter.retryAfter("k", 1)).toBe(0);
  });
});
