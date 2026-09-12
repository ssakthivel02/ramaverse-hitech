import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const charactersPath = fileURLToPath(new URL("../client/src/pages/Characters.tsx", import.meta.url));
const source = readFileSync(charactersPath, "utf8");

describe("Characters failure-state contract", () => {
  it("surfaces query failures instead of silently rendering an empty character surface", () => {
    expect(source).toContain("data: charactersList, isLoading, error");
    expect(source).toContain('role="alert"');
    expect(source).toContain('t("unexpectedError")');
    expect(source).toContain("{!error && <section");
    expect(source).toContain("{error ? (");
  });
});
