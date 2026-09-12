import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./SargaReader.tsx", import.meta.url), "utf8");

describe("Sarga reader failure state", () => {
  it("distinguishes query failures from genuinely unavailable records", () => {
    expect(source).toContain("const { data, isLoading, error } = trpc.ramaverse.getSargaDetail.useQuery");

    const errorState = source.indexOf("if (error)");
    const unavailableState = source.indexOf("if (!sarga)");

    expect(errorState).toBeGreaterThan(-1);
    expect(unavailableState).toBeGreaterThan(errorState);
    expect(source).toContain('role="alert"');
    expect(source).toContain('t("unexpectedError")');
  });
});
