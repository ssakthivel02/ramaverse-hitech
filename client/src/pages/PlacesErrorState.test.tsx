import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("Places API failure state", () => {
  const source = fs.readFileSync(path.resolve(process.cwd(), "client/src/pages/Places.tsx"), "utf8");

  it("surfaces query failures accessibly instead of rendering a silent empty grid", () => {
    expect(source).toContain("data: placesList, isLoading, error");
    expect(source).toContain(") : error ? (");
    expect(source).toContain('role="alert"');
    expect(source).toContain('t("unexpectedError")');
  });
});
