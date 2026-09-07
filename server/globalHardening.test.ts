import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "..");
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

describe("global discovery and operations hardening", () => {
  it("declares safe technical SEO and structured Website metadata", () => {
    const html = read("client/index.html");
    expect(html).toContain('rel="canonical"');
    expect(html).toContain('hreflang="ta"');
    expect(html).toContain('property="og:title"');
    expect(html).toContain('name="twitter:card"');
    expect(html).toContain('type="application/ld+json"');
  });

  it("keeps internal and staging-like paths out of indexing", () => {
    const robots = read("client/public/robots.txt");
    const server = read("server/_core/index.ts");
    expect(robots).toContain("Disallow: /api/");
    expect(robots).toContain("Disallow: /reconciliation");
    expect(server).toContain('X-Robots-Tag');
    expect(server).toContain('noindex, nofollow, noarchive');
  });

  it("uses a versioned PWA cache and preserves a reset path", () => {
    const sw = read("client/public/sw.js");
    expect(sw).toContain('ramaverse-cache-v5');
    expect(sw).toContain('CLEAR_CACHE');
    expect(sw).toContain('GET_CACHE_VERSION');
    expect(sw).toContain('/offline-reset.html');
  });

  it("contains provider-neutral, privacy-respecting health surfaces", () => {
    const server = read("server/_core/index.ts");
    expect(server).toContain('app.get("/ops/health"');
    expect(server).toContain('app.get("/ops/release-state"');
    expect(server).toContain('userQuestionLogging: "disabled"');
    expect(server).toContain('Content-Security-Policy-Report-Only');
  });
});
