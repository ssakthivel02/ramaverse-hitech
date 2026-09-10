import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("RamaVerse service worker operational endpoint cache policy", () => {
  const serviceWorker = readFileSync(resolve(process.cwd(), "client/public/sw.js"), "utf8");

  it("bypasses health, readiness, release and ops endpoints from cache handling", () => {
    expect(serviceWorker).toContain('"/healthz"');
    expect(serviceWorker).toContain('"/readyz"');
    expect(serviceWorker).toContain('"/releasez"');
    expect(serviceWorker).toContain('pathname.startsWith("/ops/")');
    expect(serviceWorker).toContain("isOperationalPath(url.pathname)");
  });

  it("rotates the cache version so previously cached responses are discarded", () => {
    expect(serviceWorker).toContain('const CACHE_NAME = "ramaverse-cache-v6"');
  });
});
