import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const source = fs.readFileSync(path.resolve(import.meta.dirname, "OwnerCommandCenter.tsx"), "utf8");
const data = fs.readFileSync(path.resolve(import.meta.dirname, "../lib/ownerCommandCenterData.ts"), "utf8");

describe("Owner Command Center contract", () => {
  it("is admin-gated and does not expose fake actions", () => {
    expect(source).toContain('auth.user.role !== "admin"');
    expect(source).toContain("There are no fake buttons here");
    expect(source).not.toContain("onClick={() => deploy");
    expect(source).not.toContain("onClick={() => promote");
  });

  it("contains the requested state sections", () => {
    for (const id of ["health", "corpus", "content", "languages", "media", "parity", "release", "quality", "actions"]) {
      expect(source).toContain(`id=\"${id}\"`);
    }
  });

  it("keeps the active baseline and publication boundaries explicit", () => {
    expect(data).toContain('["Canonical count", "550", "FROZEN"]');
    expect(data).toContain('["Staging", "0 published", "PASS"]');
    expect(data).toContain('Website deployment", "OWNER CONTROLLED / NOT DEPLOYED"');
  });
});
