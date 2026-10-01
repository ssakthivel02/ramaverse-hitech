// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { syncSeoMetadata } from "./seo";

describe("SEO metadata locale governance", () => {
  beforeEach(() => {
    document.head.innerHTML = "";
  });

  it("keeps a governed localized public route indexable", () => {
    syncSeoMetadata("/quizzes", "ta");
    expect(document.querySelector('meta[name="robots"]')?.getAttribute("content")).toBe("index,follow");
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe("https://ramaverse.omsaravanabhava.org/ta/quizzes");
    expect(document.querySelectorAll('link[rel="alternate"][hreflang]').length).toBe(7);
  });

  it("fails closed for a recognized but non-governed locale", () => {
    syncSeoMetadata("/quizzes", "fr");
    expect(document.querySelector('meta[name="robots"]')?.getAttribute("content")).toBe("noindex,nofollow");
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe("https://ramaverse.omsaravanabhava.org/");
    expect(document.querySelector('meta[property="og:url"]')?.getAttribute("content")).toBe("https://ramaverse.omsaravanabhava.org/");
    expect(document.querySelectorAll('link[rel="alternate"][hreflang]').length).toBe(0);
  });
});
