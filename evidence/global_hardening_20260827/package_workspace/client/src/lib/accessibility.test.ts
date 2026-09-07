import { afterEach, describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { focusMainContent } from "./accessibility";

describe("skip navigation focus", () => {
  afterEach(() => { document.body.innerHTML = ""; });

  it("moves keyboard focus to the stable main-content destination", () => {
    document.body.innerHTML = '<div id="main-content" tabindex="-1"></div>';
    expect(focusMainContent()).toBe(true);
    expect(document.activeElement?.id).toBe("main-content");
  });

  it("fails safely when no main-content destination exists", () => {
    expect(focusMainContent()).toBe(false);
  });

  it("keeps a global reduced-motion override for animated interfaces", () => {
    const css = fs.readFileSync(path.resolve(process.cwd(), "client/src/index.css"), "utf8");
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toContain("animation-duration: 0.01ms !important");
  });

  it("defines priority Indic font fallbacks and language-aware line height", () => {
    const css = fs.readFileSync(path.resolve(process.cwd(), "client/src/index.css"), "utf8");
    expect(css).toContain("Noto Sans Tamil");
    expect(css).toContain("Noto Sans Devanagari");
    expect(css).toContain(":lang(ta)");
    expect(css).toContain("line-height: 1.55");
    expect(css).toContain(":lang(ta) button");
    expect(css).toContain("unicode-bidi: plaintext");
  });
});
