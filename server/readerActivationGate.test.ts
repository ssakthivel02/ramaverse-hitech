import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  canReportReaderReady,
  evaluateReaderActivationDeclaration,
  loadReaderActivationDeclaration,
} from "./readerActivationGate";

const roots: string[] = [];
function fixture(input: unknown): string {
  const root = mkdtempSync(path.join(os.tmpdir(), "ramaverse-activation-"));
  roots.push(root);
  writeFileSync(path.join(root, "CONTINUATION_AUTHORITY.json"), JSON.stringify(input));
  return root;
}
afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe("Reader operational activation gate", () => {
  it("refuses the actual unresolved repository authority regardless of database-probe result", () => {
    const decision = loadReaderActivationDeclaration();
    expect(decision.permitted).toBe(false);
    expect(decision.reasons).toEqual(expect.arrayContaining([
      expect.stringContaining("CONFLICT_REQUIRES_RECONCILIATION"),
      expect.stringContaining("promotion_allowed"),
      expect.stringContaining("reader_corpus_activation_implied"),
    ]));
    expect(canReportReaderReady(true, decision)).toBe(false);
  });

  it.each([
    ["unresolved conflict", { status: "CONFLICT_REQUIRES_RECONCILIATION", promotion_allowed: true, reader_corpus_activation_implied: true }],
    ["no promotion approval", { status: "RESOLVED_TEST_ONLY", promotion_allowed: false, reader_corpus_activation_implied: true }],
    ["no Reader activation declaration", { status: "RESOLVED_TEST_ONLY", promotion_allowed: true, reader_corpus_activation_implied: false }],
    ["missing Reader activation declaration", { status: "RESOLVED_TEST_ONLY", promotion_allowed: true }],
    ["string instead of boolean", { status: "RESOLVED_TEST_ONLY", promotion_allowed: "true", reader_corpus_activation_implied: "true" }],
    ["missing authority", null],
  ])("fails closed for %s", (_label, authority) => {
    expect(evaluateReaderActivationDeclaration(authority).permitted).toBe(false);
  });

  it("refuses missing or invalid on-disk authority", () => {
    const root = mkdtempSync(path.join(os.tmpdir(), "ramaverse-activation-"));
    roots.push(root);
    expect(loadReaderActivationDeclaration(root).permitted).toBe(false);
    writeFileSync(path.join(root, "CONTINUATION_AUTHORITY.json"), "not JSON");
    expect(loadReaderActivationDeclaration(root).permitted).toBe(false);
  });

  it("requires both an explicit declaration and a successful database probe", () => {
    const approved = evaluateReaderActivationDeclaration({
      status: "RESOLVED_TEST_ONLY",
      promotion_allowed: true,
      reader_corpus_activation_implied: true,
    });
    expect(approved.permitted).toBe(true);
    expect(canReportReaderReady(false, approved)).toBe(false);
    expect(canReportReaderReady(true, approved)).toBe(true);
    expect(canReportReaderReady(true, loadReaderActivationDeclaration(fixture({
      status: "CONFLICT_REQUIRES_RECONCILIATION",
      promotion_allowed: false,
      reader_corpus_activation_implied: false,
    })))).toBe(false);
  });
});
