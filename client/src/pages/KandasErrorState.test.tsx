import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Kandas API failure state", () => {
  it("distinguishes load failures from an empty explorer", () => {
    const source = readFileSync("client/src/pages/Kandas.tsx", "utf8");

    expect(source).toContain("const { data: kandas, isLoading, error } = trpc.ramaverse.getKandas.useQuery();");
    expect(source).toContain('role="alert"');
    expect(source).toContain('t("unexpectedError")');
    expect(source).toContain(") : error ? (");
  });
});
