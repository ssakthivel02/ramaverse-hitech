import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const source = fs.readFileSync(path.resolve(import.meta.dirname, "NotFound.tsx"), "utf8");

describe("Not Found localized home navigation", () => {
  it("preserves the active interface language when returning home", () => {
    expect(source).toContain('const { language } = useTranslation();');
    expect(source).toContain('setLocation(localizedPath(language, "/"));');
    expect(source).not.toContain('setLocation("/");');
  });
});
