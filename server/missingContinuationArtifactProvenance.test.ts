import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

type Authority = {
  status: string;
  acquisition_allowed: boolean;
  promotion_allowed: boolean;
  verified_next_source: string | null;
  missing_artifact_provenance_file: string;
  conflicting_markers: Array<{ marker: string; disposition: string }>;
};

type Provenance = {
  repository: string;
  artifact_claim: string;
  claimed_next_source: string;
  claimed_record_count: number;
  disposition: string;
  artifact_recovered: boolean;
  claim_verified: boolean;
  usable_as_continuation_authority: boolean;
  search_scope: Array<{ scope: string; repository: string; query: string; result_count: number }>;
  limitations: string[];
  conclusion: string;
};

const root = process.cwd();
const readJson = <T>(path: string) =>
  JSON.parse(readFileSync(resolve(root, path), "utf8")) as T;

describe("missing continuation artifact provenance", () => {
  const authority = readJson<Authority>("CONTINUATION_AUTHORITY.json");
  const provenance = readJson<Provenance>("MISSING_CONTINUATION_ARTIFACT_PROVENANCE.json");

  it("binds the unrecovered artifact disposition to fail-closed continuation authority", () => {
    expect(authority.missing_artifact_provenance_file).toBe(
      "MISSING_CONTINUATION_ARTIFACT_PROVENANCE.json",
    );
    expect(authority.status).toBe("CONFLICT_REQUIRES_RECONCILIATION");
    expect(authority.acquisition_allowed).toBe(false);
    expect(authority.promotion_allowed).toBe(false);
    expect(authority.verified_next_source).toBeNull();

    expect(provenance.repository).toBe("ssakthivel02/ramaverse-hitech");
    expect(provenance.artifact_claim).toBe("continuation-state-2026-08-14.json");
    expect(provenance.claimed_next_source).toBe("Uttara Kanda Chapter 95");
    expect(provenance.claimed_record_count).toBe(50);
    expect(provenance.disposition).toBe(
      "UNRECOVERED_ACROSS_CURRENTLY_ACCESSIBLE_GITHUB_SOURCES",
    );
    expect(provenance.artifact_recovered).toBe(false);
    expect(provenance.claim_verified).toBe(false);
    expect(provenance.usable_as_continuation_authority).toBe(false);
  });

  it("records canonical, owner-wide, and legacy read-only search scope without claiming non-existence", () => {
    expect(provenance.search_scope.length).toBeGreaterThanOrEqual(6);
    expect(provenance.search_scope.every(({ result_count }) => result_count === 0)).toBe(true);
    expect(provenance.search_scope.some(({ repository }) => repository === "ssakthivel02/ramaverse")).toBe(
      true,
    );
    expect(
      provenance.search_scope.some(({ repository }) => repository === "ssakthivel02/sitarama-legacy"),
    ).toBe(true);
    expect(provenance.limitations.join(" ")).toMatch(/does not prove|never existed/i);
    expect(provenance.limitations.join(" ")).toMatch(/read-only/i);
  });

  it("keeps the Uttara marker explicitly non-authoritative", () => {
    const uttara = authority.conflicting_markers.find(
      ({ marker }) => marker === "Uttara Kanda Chapter 95",
    );
    expect(uttara).toBeDefined();
    expect(uttara?.disposition).toMatch(/unverified|unrecovered/i);
    expect(uttara?.disposition).toMatch(/unusable|not.*authority/i);
    expect(provenance.conclusion).toMatch(/does not validate/i);
    expect(provenance.conclusion).toMatch(/does not resolve/i);
  });
});
