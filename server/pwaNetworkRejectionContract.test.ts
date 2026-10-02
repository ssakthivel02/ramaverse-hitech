import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

const workerSource = fs.readFileSync(path.resolve(import.meta.dirname, "../client/public/sw.js"), "utf8");

// Isolate process-level rejection observation from Vitest's own error handlers.
const harness = `
import fs from "node:fs";
import vm from "node:vm";
const { source, cached, offline, pathname } = JSON.parse(fs.readFileSync(0, "utf8"));
const unhandled = [];
process.on("unhandledRejection", error => unhandled.push(error.message));
const handlers = new Map();
const cachedResponse = { kind: "cached" };
const freshResponse = { kind: "network", ok: true, clone() { return { kind: "network" }; } };
const writes = [];
let cacheLookups = 0;
let fetchCalls = 0;
vm.runInNewContext(source, {
  URL,
  self: {
    location: { origin: "https://ramaverse.test" },
    addEventListener: (type, handler) => handlers.set(type, handler),
  },
  caches: {
    match: async () => { cacheLookups++; return cached ? cachedResponse : undefined; },
    open: async () => ({ put: async (request, response) => writes.push({ url: request.url, kind: response.kind }) }),
  },
  fetch: () => {
    fetchCalls++;
    return new Promise((resolve, reject) => setImmediate(() => offline ? reject(new Error("offline")) : resolve(freshResponse)));
  },
});
let responsePromise;
handlers.get("fetch")({
  request: { url: "https://ramaverse.test" + pathname, method: "GET", mode: "cors" },
  respondWith: promise => { responsePromise = promise; },
});
let response;
let responseError;
try { response = await responsePromise; } catch (error) { responseError = error.message; }
await new Promise(resolve => setImmediate(resolve));
await new Promise(resolve => setImmediate(resolve));
console.log(JSON.stringify({ responseKind: response?.kind ?? null, responseError: responseError ?? null, unhandled, writes, cacheLookups, fetchCalls }));
`;

function exerciseWorker(cached: boolean, offline: boolean, pathname = "/assets/app.js") {
  const result = spawnSync(process.execPath, ["--input-type=module", "-e", harness], {
    input: JSON.stringify({ source: workerSource, cached, offline, pathname }),
    encoding: "utf8",
    timeout: 10_000,
  });
  expect(result.error).toBeUndefined();
  expect(result.status, result.stderr).toBe(0);
  return JSON.parse(result.stdout) as {
    responseKind: string | null;
    responseError: string | null;
    unhandled: string[];
    writes: { url: string; kind: string }[];
    cacheLookups: number;
    fetchCalls: number;
  };
}

describe("PWA asset network rejection handling", () => {
  it("serves a cached asset offline without an unhandled background rejection", () => {
    const result = exerciseWorker(true, true);
    expect(result.responseKind).toBe("cached");
    expect(result.responseError).toBeNull();
    expect(result.unhandled).toEqual([]);
    expect(result.fetchCalls).toBe(1);
  });

  it("still refreshes a cached asset online", () => {
    const result = exerciseWorker(true, false);
    expect(result.responseKind).toBe("cached");
    expect(result.unhandled).toEqual([]);
    expect(result.writes).toEqual([{ url: "https://ramaverse.test/assets/app.js", kind: "network" }]);
  });

  it("still returns and caches a network asset on a cache miss", () => {
    const result = exerciseWorker(false, false);
    expect(result.responseKind).toBe("network");
    expect(result.unhandled).toEqual([]);
    expect(result.writes).toHaveLength(1);
  });

  it("preserves the existing offline cache-miss fallback without an unhandled rejection", () => {
    const result = exerciseWorker(false, true);
    expect(result.responseKind).toBeNull();
    expect(result.responseError).toBeNull();
    expect(result.unhandled).toEqual([]);
  });

  it("does not mask API network failure or serve API content from cache", () => {
    const result = exerciseWorker(true, true, "/api/trpc/public");
    expect(result.responseError).toBe("offline");
    expect(result.responseKind).toBeNull();
    expect(result.cacheLookups).toBe(0);
    expect(result.writes).toEqual([]);
    expect(result.unhandled).toEqual([]);
  });
});
