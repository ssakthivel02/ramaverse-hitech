import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { getDocumentTitle, getRouteAccessibilityMeta } from "./routeAccessibility";

describe("route accessibility metadata", () => {
  it("provides stable titles and announcements for canonical routes", () => {
    expect(getRouteAccessibilityMeta("/wisdom")).toEqual({
      title: "Wisdom",
      announcement: "Wisdom page loaded",
    });
    expect(getDocumentTitle("/wisdom")).toBe("Wisdom | RamaVerse");
    expect(getDocumentTitle("/")).toBe("RamaVerse");
  });

  it("labels dynamic Sarga reader routes and unknown routes safely", () => {
    expect(getRouteAccessibilityMeta("/sargas/AYO-001").title).toBe("Sarga Reader");
    expect(getRouteAccessibilityMeta("/not-a-route").title).toBe("Page not found");
  });
});

describe("SPA route accessibility integration", () => {
  const source = fs.readFileSync(path.resolve(process.cwd(), "client/src/App.tsx"), "utf8");

  it("keeps route changes announced and moves focus without stealing initial page-load focus", () => {
    expect(source).toContain('role="status"');
    expect(source).toContain('aria-live="polite"');
    expect(source).toContain("previousPath.current === null");
    expect(source).toContain("focusMainContent()");
    expect(source).toContain("getDocumentTitle(normalized.path)");
  });
});
