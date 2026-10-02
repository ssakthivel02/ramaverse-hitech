import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { describe, expect, it } from "vitest";

const source = fs.readFileSync(path.resolve(import.meta.dirname, "../client/public/sw.js"), "utf8");
const activeName = "ramaverse-cache-v6";
const foreignName = "other-app-cache";

async function fetchThroughWorker(pathname: string, mode: string, online: boolean, foreign: Record<string, string>, owned: Record<string, string>) {
  const entries = new Map([[foreignName, new Map(Object.entries(foreign))], [activeName, new Map(Object.entries(owned))]]);
  const handlers = new Map<string, (event: unknown) => void>();
  const lookups: string[] = [];
  const lifetime: Promise<unknown>[] = [];
  const writes: string[] = [];
  const pathnameOf = (request: string | { url: string }) => new URL(typeof request === "string" ? request : request.url, "https://ramaverse.test").pathname;
  vm.runInNewContext(source, {
    URL,
    self: { location: { origin: "https://ramaverse.test" }, addEventListener: (type: string, handler: (event: unknown) => void) => handlers.set(type, handler) },
    caches: {
      match: async (request: string | { url: string }, options?: { cacheName?: string }) => {
        lookups.push(options?.cacheName || "ALL_CACHES");
        for (const [name, cache] of entries) {
          if (options?.cacheName && options.cacheName !== name) continue;
          const body = cache.get(pathnameOf(request));
          if (body !== undefined) return new Response(body);
        }
        return undefined;
      },
      open: async (name: string) => ({
        put: async (request: { url: string }, response: Response) => {
          writes.push(name);
          entries.get(name)!.set(pathnameOf(request), await response.text());
        },
      }),
    },
    fetch: async () => {
      if (!online) throw new Error("offline");
      return new Response("NETWORK_RESPONSE");
    },
  });
  let responsePromise!: Promise<Response | undefined>;
  handlers.get("fetch")!({
    request: { url: "https://ramaverse.test" + pathname, method: "GET", mode },
    respondWith: (promise: typeof responsePromise) => { responsePromise = promise; },
    waitUntil: (promise: Promise<unknown>) => lifetime.push(promise),
  });
  let body: string | undefined;
  let error: string | undefined;
  try { body = await (await responsePromise)?.text(); } catch (failure) { error = (failure as Error).message; }
  await Promise.all(lifetime);
  return { body, error, lookups, writes, foreignAfter: Object.fromEntries(entries.get(foreignName)!) };
}

describe("PWA active-cache read ownership", () => {
  const cases: { name: string; path: string; mode: string; online: boolean; foreign: Record<string, string>; owned: Record<string, string>; body: string | undefined }[] = [
    { name: "asset miss uses network instead of a foreign response", path: "/assets/probe.js", mode: "cors", online: true, foreign: { "/assets/probe.js": "FOREIGN" }, owned: {}, body: "NETWORK_RESPONSE" },
    { name: "asset hit uses the active cache despite an earlier foreign cache", path: "/assets/probe.js", mode: "cors", online: false, foreign: { "/assets/probe.js": "FOREIGN" }, owned: { "/assets/probe.js": "OWNED_ASSET" }, body: "OWNED_ASSET" },
    { name: "navigation hit uses the active cached page", path: "/page", mode: "navigate", online: false, foreign: { "/page": "FOREIGN" }, owned: { "/page": "OWNED_PAGE" }, body: "OWNED_PAGE" },
    { name: "navigation miss falls back to the owned home", path: "/unvisited", mode: "navigate", online: false, foreign: { "/unvisited": "FOREIGN", "/": "FOREIGN_HOME" }, owned: { "/": "OWNED_HOME" }, body: "OWNED_HOME" },
    { name: "missing home falls back to the owned recovery page", path: "/unvisited", mode: "navigate", online: false, foreign: { "/": "FOREIGN_HOME", "/offline-reset.html": "FOREIGN_RECOVERY" }, owned: { "/offline-reset.html": "OWNED_RECOVERY" }, body: "OWNED_RECOVERY" },
    { name: "foreign recovery alone cannot satisfy offline navigation", path: "/unvisited", mode: "navigate", online: false, foreign: { "/offline-reset.html": "FOREIGN_RECOVERY" }, owned: {}, body: undefined },
    { name: "foreign asset alone cannot satisfy an offline miss", path: "/assets/probe.js", mode: "cors", online: false, foreign: { "/assets/probe.js": "FOREIGN" }, owned: {}, body: undefined },
  ];

  for (const scenario of cases) {
    it(scenario.name, async () => {
      const result = await fetchThroughWorker(scenario.path, scenario.mode, scenario.online, scenario.foreign, scenario.owned);
      expect(result.body).toBe(scenario.body);
      expect(result.error).toBeUndefined();
      expect(result.lookups.length).toBeGreaterThan(0);
      expect(result.lookups.every(name => name === activeName)).toBe(true);
      expect(result.foreignAfter).toEqual(scenario.foreign);
      expect(result.writes.every(name => name === activeName)).toBe(true);
    });
  }

  for (const path of ["/readyz", "/api/trpc/probe"]) {
    it(`${path} still bypasses every cache`, async () => {
      const result = await fetchThroughWorker(path, "cors", false, { [path]: "FOREIGN" }, { [path]: "OWNED" });
      expect(result.error).toBe("offline");
      expect(result.body).toBeUndefined();
      expect(result.lookups).toEqual([]);
      expect(result.writes).toEqual([]);
    });
  }
});
