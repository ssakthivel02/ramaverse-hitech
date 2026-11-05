import { readFileSync } from "node:fs";
import path from "node:path";
import { evaluateReaderLoadAuthority } from "./readerManifest";

export type ReaderActivationDecision = { permitted: boolean; reasons: string[] };

/**
 * Extra operational-readiness veto, NOT a substitute for the approved Reader
 * manifest, source registry, complete DB parity or explicit release approval.
 */
export function evaluateReaderActivationDeclaration(authority: unknown): ReaderActivationDecision {
  const gate = evaluateReaderLoadAuthority(authority);
  const reasons = [...gate.reasons];
  const declaration =
    authority !== null && typeof authority === "object" && !Array.isArray(authority)
      ? (authority as Record<string, unknown>)
      : null;
  if (declaration?.reader_corpus_activation_implied !== true) {
    reasons.push("reader_corpus_activation_implied is not explicitly true");
  }
  return { permitted: reasons.length === 0, reasons };
}

/** Read only the repository-controlled authority file; never accept a request/env override. */
export function loadReaderActivationDeclaration(root: string = process.cwd()): ReaderActivationDecision {
  try {
    const authority = JSON.parse(
      readFileSync(path.join(root, "CONTINUATION_AUTHORITY.json"), "utf8"),
    );
    return evaluateReaderActivationDeclaration(authority);
  } catch {
    return { permitted: false, reasons: ["authority file missing, invalid or unreadable"] };
  }
}

/** Operational readiness requires the database probe AND declared activation authority. */
export function canReportReaderReady(databaseReady: boolean, authority: ReaderActivationDecision): boolean {
  return databaseReady === true && authority.permitted === true;
}
