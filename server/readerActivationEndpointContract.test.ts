import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const index = readFileSync("server/_core/index.ts", "utf8");

describe("operational endpoints fail closed on unresolved Reader authority", () => {
  it("gates both /readyz and /ops/health on authority AND the Reader database probe", () => {
    expect(index).toContain("const authority = loadReaderActivationDeclaration();");
    expect(index.split("const ready = canReportReaderReady(databaseReady, authority);")).toHaveLength(3);
    expect(index).toContain('readerAuthority: authority.permitted ? "declared" : "blocked"');
  });
  it("preserves /healthz as liveness, not Reader approval", () => {
    expect(index).toContain('app.get("/healthz", (_req, res) => {');
    expect(index).toContain('res.status(200).json({ status: "alive"');
  });
});
