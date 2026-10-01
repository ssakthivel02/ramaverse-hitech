import { describe, expect, it } from "vitest";
import { absolutePublicUrl, INDEXABLE_LOCALES, INDEXABLE_PUBLIC_ROUTES, isIndexablePublicRoute } from "./seo";

describe("SEO public route contract", () => {
  it("includes intended public discovery surfaces", () => {
    expect(INDEXABLE_PUBLIC_ROUTES).toContain("/quizzes");
    expect(INDEXABLE_PUBLIC_ROUTES).toContain("/walk-with-rama");
  });

  it("excludes operational and dynamic surfaces by default", () => {
    expect(isIndexablePublicRoute("/owner-command-center")).toBe(false);
    expect(isIndexablePublicRoute("/reconciliation")).toBe(false);
    expect(isIndexablePublicRoute("/sargas/example")).toBe(false);
  });

  it("limits crawler language alternates to the governed SEO set", () => {
    expect(INDEXABLE_LOCALES).toEqual(["en", "ta", "hi", "te", "kn", "ml"]);
  });

  it("builds deterministic canonical URLs", () => {
    expect(absolutePublicUrl("/quizzes")).toBe("https://ramaverse.omsaravanabhava.org/quizzes");
    expect(absolutePublicUrl("/quizzes", "ta")).toBe("https://ramaverse.omsaravanabhava.org/ta/quizzes");
    expect(absolutePublicUrl("/", "ta")).toBe("https://ramaverse.omsaravanabhava.org/ta/");
  });
});
