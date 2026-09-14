import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("RamaNavbar mobile disclosure semantics", () => {
  it("exposes expanded state and controls the mobile menu region", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/components/RamaNavbar.tsx"), "utf8");

    expect(source).toContain('aria-expanded={mobileMenuOpen}');
    expect(source).toContain('aria-controls="ramaverse-mobile-menu"');
    expect(source).toContain('id="ramaverse-mobile-menu"');
  });
});
