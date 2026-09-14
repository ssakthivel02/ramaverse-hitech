import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const source = readFileSync(fileURLToPath(new URL("./Intelligence.tsx", import.meta.url)), "utf8");

describe("Intelligence fetching status", () => {
  it("announces the canonical-index fetch as a polite atomic status", () => {
    expect(source).toMatch(/\(modernResult\.isFetching \|\| legacyResult\.isFetching\) && <p role="status" aria-live="polite" aria-atomic="true"[^>]*>Reading the canonical index…<\/p>/);
  });
});
