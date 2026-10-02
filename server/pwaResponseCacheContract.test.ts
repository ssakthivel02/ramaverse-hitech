import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

const workerSource = fs.readFileSync(path.resolve(import.meta.dirname, "../client/public/sw.js"), "utf8");
const harness = `
import fs from "node:fs";
import vm from "node:vm";
const { source, mode, failStorage } = JSON.parse(fs.readFileSync(0, "utf8"));
const handlers = new Map();
const unhandled = [];
const lifetime = [];
const writes = [];
process.on("unhandledRejection", error => unhandled.push(error.message));
let releaseCache;
const cacheReady = new Promise(resolve => { releaseCache = resolve; });
vm.runInNewContext(source, {
  URL,
  self: { location: { origin: "https://ramaverse.test" }, addEventListener: (type, handler) => handlers.set(type, handler) },
  caches: {
    match: async () => undefined,
    open: async () => {
      await cacheReady;
      if (failStorage) throw new Error("Cache Storage unavailable");
      return { put: async (request, response) => writes.push({ url: request.url, body: await response.text() }) };
    },
  },
  fetch: async () => new Response("FRESH_NETWORK_BODY"),
});
let responsePromise;
handlers.get("fetch")({
  request: { url: "https://ramaverse.test/" + (mode === "navigate" ? "home" : "assets/app.js"), method: "GET", mode },
  respondWith: promise => { responsePromise = promise; },
  waitUntil: promise => lifetime.push(promise),
});
const response = await responsePromise;
// Consume the response before Cache Storage opens, as a browser can do.
const body = await response.text();
const trackedBeforeRelease = lifetime.length;
releaseCache();
await Promise.all(lifetime);
await new Promise(resolve => setImmediate(resolve));
await new Promise(resolve => setImmediate(resolve));
console.log(JSON.stringify({ body, writes, unhandled, trackedBeforeRelease }));
`;

function exerciseWorker(mode: string, failStorage = false) {
  const result = spawnSync(process.execPath, ["--input-type=module", "-e", harness], {
    input: JSON.stringify({ source: workerSource, mode, failStorage }),
    encoding: "utf8",
    timeout: 10_000,
  });
  expect(result.error).toBeUndefined();
  expect(result.status, result.stderr).toBe(0);
  return JSON.parse(result.stdout) as {
    body: string;
    writes: { url: string; body: string }[];
    unhandled: string[];
    trackedBeforeRelease: number;
  };
}

describe("PWA response body and cache-write lifetime", () => {
  for (const mode of ["navigate", "cors"]) {
    it(`caches a ${mode} response even when its body is consumed before storage opens`, () => {
      const result = exerciseWorker(mode);
      expect(result.body).toBe("FRESH_NETWORK_BODY");
      expect(result.writes).toEqual([{
        url: "https://ramaverse.test/" + (mode === "navigate" ? "home" : "assets/app.js"),
        body: "FRESH_NETWORK_BODY",
      }]);
      expect(result.trackedBeforeRelease).toBeGreaterThan(0);
      expect(result.unhandled).toEqual([]);
    });

    it(`preserves a ${mode} network response when Cache Storage rejects`, () => {
      const result = exerciseWorker(mode, true);
      expect(result.body).toBe("FRESH_NETWORK_BODY");
      expect(result.writes).toEqual([]);
      expect(result.trackedBeforeRelease).toBeGreaterThan(0);
      expect(result.unhandled).toEqual([]);
    });
  }
});
