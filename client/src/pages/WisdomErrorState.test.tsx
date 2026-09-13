import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("Wisdom API error state", () => {
  const source = fs.readFileSync(path.resolve(process.cwd(), "client/src/pages/Wisdom.tsx"), "utf8");

  it("surfaces query failures instead of silently rendering an empty grid", () => {
    expect(source).toContain("data: wisdomList, isLoading, error");
    expect(source).toContain('role="alert"');
    expect(source).toContain('t("unexpectedError")');
    expect(source).toContain("!isLoading && !error && wisdomList?.length === 0");
  });
});
