import { describe, expect, it } from "vitest";
import { createFixedWindowLimiter } from "./rateLimit";

describe("bounded public API limiter", () => {
  it("permits requests up to the threshold and returns Retry-After after it", () => {
    let clock = 0;
    const limiter = createFixedWindowLimiter({ maxRequests: 2, windowMs: 60_000, maxEntries: 10, now: () => clock });
    expect(limiter.consume("visitor")).toEqual({ allowed: true, remaining: 1 });
    expect(limiter.consume("visitor")).toEqual({ allowed: true, remaining: 0 });
    expect(limiter.consume("visitor")).toEqual({ allowed: false, retryAfterSeconds: 60 });
    clock = 59_001;
    expect(limiter.consume("visitor")).toEqual({ allowed: false, retryAfterSeconds: 1 });
    clock = 60_000;
    expect(limiter.consume("visitor")).toEqual({ allowed: true, remaining: 1 });
  });

  it("isolates clients and cannot be bypassed by interleaving keys", () => {
    const limiter = createFixedWindowLimiter({ maxRequests: 1, windowMs: 1000, maxEntries: 5, now: () => 0 });
    expect(limiter.consume("client-a").allowed).toBe(true);
    expect(limiter.consume("client-b").allowed).toBe(true);
    expect(limiter.consume("client-a").allowed).toBe(false);
    expect(limiter.size()).toBe(2);
  });

  it("caps memory and refuses new keys until old windows expire", () => {
    let clock = 0;
    const limiter = createFixedWindowLimiter({ maxRequests: 1, windowMs: 10_000, maxEntries: 2, now: () => clock });
    limiter.consume("a"); limiter.consume("b");
    expect(limiter.consume("third")).toEqual({ allowed: false, retryAfterSeconds: 10 });
    expect(limiter.size()).toBe(2);
    clock = 10_000;
    expect(limiter.consume("third").allowed).toBe(true);
    expect(limiter.size()).toBe(1);
  });

  it("rejects malformed configuration and empty keys instead of bypassing the limit", () => {
    expect(() => createFixedWindowLimiter({ maxRequests: 0, windowMs: 1000, maxEntries: 1 })).toThrow();
    const limiter = createFixedWindowLimiter({ maxRequests: 1, windowMs: 1000, maxEntries: 1 });
    expect(limiter.consume("")).toMatchObject({ allowed: false });
  });
});
