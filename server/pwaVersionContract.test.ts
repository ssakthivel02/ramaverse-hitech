import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "..");
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

describe("PWA version reporting contract", () => {
  it("keeps operational PWA version reporting aligned with the service-worker cache version", () => {
    const serviceWorker = read("client/public/sw.js");
    const server = read("server/_core/index.ts");
    const match = serviceWorker.match(/const CACHE_NAME = "([^"]+)"/);

    expect(match?.[1]).toBeTruthy();
    const cacheName = match![1];

    expect(server.match(/pwaVersion:/g)?.length).toBe(3);
    expect(server.match(new RegExp(`pwaVersion: "${cacheName}"`, "g"))?.length).toBe(3);
  });
});
