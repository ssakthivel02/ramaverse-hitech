import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("RamaNavbar mobile current-page semantics", () => {
  it("exposes the active mobile route with aria-current", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/components/RamaNavbar.tsx"), "utf8");

    const mobileCurrentPageBindings = source.match(/aria-current=\{currentPath === item\.href \? 'page' : undefined\}/g) ?? [];
    expect(mobileCurrentPageBindings).toHaveLength(2);
  });
});
