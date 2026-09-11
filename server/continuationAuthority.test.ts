import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

type ContinuationAuthority = {
  repository: string;
  status: string;
  acquisition_allowed: boolean;
  promotion_allowed: boolean;
  reader_corpus_activation_implied: boolean;
  verified_next_source: string | null;
  conflicting_markers: Array<{ marker: string; disposition: string }>;
};

describe("RamaVerse continuation authority guard", () => {
  const authority = JSON.parse(
    readFileSync(resolve(process.cwd(), "CONTINUATION_AUTHORITY.json"), "utf8"),
  ) as ContinuationAuthority;

  it("binds continuation authority to the canonical HI-TECH repository", () => {
    expect(authority.repository).toBe("ssakthivel02/ramaverse-hitech");
  });

  it("fails closed while continuation evidence conflicts", () => {
    expect(authority.status).toBe("CONFLICT_REQUIRES_RECONCILIATION");
    expect(authority.acquisition_allowed).toBe(false);
    expect(authority.promotion_allowed).toBe(false);
    expect(authority.reader_corpus_activation_implied).toBe(false);
    expect(authority.verified_next_source).toBeNull();
  });

  it("retains every known continuation marker as explicitly non-authoritative evidence", () => {
    const markers = authority.conflicting_markers.map(({ marker }) => marker);
    expect(markers).toContain("Aranya Kanda Sarga 45 / 3.45.1");
    expect(markers).toContain("Ayodhya Kanda Sarga 66 / 2.66.1");
    expect(markers).toContain("Ayodhya Kanda Sarga 21");
    expect(markers).toContain("Uttara Kanda Chapter 95");
    expect(
      authority.conflicting_markers.every(({ disposition }) =>
        /candidate|historical|conflict|staging|unverified|absent|not canonical/i.test(disposition),
      ),
    ).toBe(true);
  });
});
