import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getDb: vi.fn() }));
vi.mock("./db", () => ({ getDb: mocks.getDb }));

import { isDevSeedEnabled, seedDatabase } from "./seed";

describe("development seed gating", () => {
  beforeEach(() => vi.resetAllMocks());

  it("is disabled by default", () => {
    expect(isDevSeedEnabled({})).toBe(false);
    expect(isDevSeedEnabled({ NODE_ENV: "development" })).toBe(false);
  });

  it("requires an explicit opt-in outside production", () => {
    expect(isDevSeedEnabled({ NODE_ENV: "development", RAMAVERSE_ENABLE_DEV_SEED: "true" })).toBe(true);
    expect(isDevSeedEnabled({ NODE_ENV: "test", RAMAVERSE_ENABLE_DEV_SEED: "true" })).toBe(true);
    expect(isDevSeedEnabled({ NODE_ENV: "development", RAMAVERSE_ENABLE_DEV_SEED: "1" })).toBe(false);
  });

  it("never runs in production even when opted in", () => {
    expect(isDevSeedEnabled({ NODE_ENV: "production", RAMAVERSE_ENABLE_DEV_SEED: "true" })).toBe(false);
  });

  it("never runs against a pinned preview/integration database identity", () => {
    expect(isDevSeedEnabled({ NODE_ENV: "test", DATABASE_EXPECTED_NAME: "ramaverse_preview", RAMAVERSE_ENABLE_DEV_SEED: "true" })).toBe(false);
  });

  it("does not open a database connection or write when disabled", async () => {
    const previous = { ...process.env };
    delete process.env.RAMAVERSE_ENABLE_DEV_SEED;
    try { await seedDatabase(); }
    finally { process.env = previous; }
    expect(mocks.getDb).not.toHaveBeenCalled();
  });
});
