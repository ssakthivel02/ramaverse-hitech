import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { INDEXABLE_PUBLIC_ROUTES, SITE_ORIGIN } from "./seo";

describe("sitemap contract", () => {
  it("matches the explicit indexable public route inventory", () => {
    const sitemap = fs.readFileSync(path.resolve(process.cwd(), "client/public/sitemap.xml"), "utf8");
    const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]).sort();
    const expected = INDEXABLE_PUBLIC_ROUTES.map(route => `${SITE_ORIGIN}${route}`).sort();
    expect(urls).toEqual(expected);
  });
});
