import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "..");
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");
const ownedCaches = ["ramaverse-cache-v5", "ramaverse-cache-v6"];
const foreignCaches = ["other-app-cache", "ramaverse-cache", "ramaverse-cacheevil", "prefix-ramaverse-cache-v6"];

function cacheStore(names: string[]) {
  const deleted: string[] = [];
  return {
    deleted,
    caches: {
      keys: async () => names,
      delete: async (name: string) => {
        deleted.push(name);
        return true;
      },
    },
  };
}

async function resetThroughWorker(names: string[]) {
  const store = cacheStore(names);
  const handlers = new Map<string, (event: unknown) => void>();
  vm.runInNewContext(read("client/public/sw.js"), {
    caches: store.caches,
    self: { addEventListener: (type: string, handler: (event: unknown) => void) => handlers.set(type, handler) },
  });
  let completion: Promise<unknown> | undefined;
  handlers.get("message")!({
    data: { type: "CLEAR_CACHE" },
    waitUntil: (promise: Promise<unknown>) => { completion = promise; },
  });
  expect(completion).toBeDefined();
  await completion;
  return store.deleted;
}

async function resetThroughPage(names: string[]) {
  const store = cacheStore(names);
  const html = read("client/public/offline-reset.html");
  // Extract the known inline script from this trusted repository fixture.
  const scriptStart = html.indexOf("<script>");
  const scriptEnd = html.indexOf("</script>", scriptStart);
  expect(scriptStart).toBeGreaterThanOrEqual(0);
  expect(scriptEnd).toBeGreaterThan(scriptStart);
  const script = html.slice(scriptStart + "<script>".length, scriptEnd);
  let click: (() => Promise<void>) | undefined;
  const status = { textContent: "" };
  vm.runInNewContext(script, {
    caches: store.caches,
    window: { caches: store.caches },
    navigator: {},
    document: {
      getElementById: (id: string) => id === "status" ? status : {
        addEventListener: (_type: string, handler: () => Promise<void>) => { click = handler; },
      },
    },
    setTimeout: () => 0,
  });
  expect(click).toBeDefined();
  await click!();
  expect(status.textContent).toContain("Offline shell reset");
  return store.deleted;
}

describe("PWA reset cache ownership", () => {
  for (const [surface, reset] of [
    ["service worker CLEAR_CACHE", resetThroughWorker],
    ["offline reset page without a controller", resetThroughPage],
  ] as const) {
    it(`${surface} deletes current and obsolete RamaVerse caches only`, async () => {
      expect(await reset([...ownedCaches, ...foreignCaches])).toEqual(ownedCaches);
    });

    it(`${surface} preserves all caches when none belong to RamaVerse`, async () => {
      expect(await reset(foreignCaches)).toEqual([]);
    });

    it(`${surface} safely handles an empty cache store`, async () => {
      expect(await reset([])).toEqual([]);
    });
  }
});
