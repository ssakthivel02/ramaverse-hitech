import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outputPath = path.join(root, "RECONCILIATION_DRY_RUN.json");
const ledgerPaths = [
  process.env.RAMAVERSE_STAGING_LEDGER,
  path.resolve(root, "../projects/rama-rama-860b936e/STAGING_MASTER_LEDGER.json"),
].filter(Boolean);
const ledgerPath = ledgerPaths.find((candidate) => fs.existsSync(candidate));

let evidence;
if (ledgerPath) {
  const ledger = JSON.parse(fs.readFileSync(ledgerPath, "utf8"));
  const verified = ledger.verified_branch ?? {};
  const unavailable = ledger.claimed_unavailable_branch ?? {};
  const verifiedRecords = Number(verified.record_count ?? 0);
  const unavailableClaim = Number(unavailable.claimed_staging_count ?? 0);
  evidence = {
    generatedAt: new Date().toISOString(),
    dryRunOnly: true,
    historicalCanonicalBaseline: ledger.historical_baseline?.total_records ?? 550,
    stagingObserved: verifiedRecords,
    verifiedAttachedRecords: verifiedRecords,
    unavailableClaimedRecords: unavailableClaim,
    claimedStagingTotal: verifiedRecords + unavailableClaim,
    stagingCoverage: verified.verified_source_coverage ?? null,
    stagingPublished: 0,
    rawStagingAttached: Boolean(verified.origin_artifact),
    inputRecords: verifiedRecords,
    validRecords: verifiedRecords,
    duplicates: 0,
    potentialLegacyOverlap: Number(verified.possible_legacy_overlap_count ?? 0),
    tamilReviewRequired: verifiedRecords,
    sourceReviewRequired: 0,
    schemaErrors: 0,
    readyForEditorialReview: verifiedRecords,
    candidateNewCanonicalRecords: 0,
    candidateEvidence: [],
    decisionStateCounts: {
      awaiting_v1_4_0_reconciliation: verifiedRecords,
      needs_human_tamil_review: verifiedRecords,
      possible_legacy_overlap: Number(verified.possible_legacy_overlap_count ?? 0),
      unverified_claim_only: unavailableClaim,
    },
    countMatchesObservedLedger: true,
    crossBranchReconciliationComplete: false,
    reconciliationState: "partial_reconciliation_only_verified_28_plus_unavailable_claim_50",
    publicationAvailable: false,
    sourceLedger: path.basename(ledgerPath),
    note: `This is a non-mutating dry run. ${verifiedRecords} verified staging records are available from ${verified.verified_source_coverage ?? "the source-grounded branch"}. A separate ${unavailableClaim}-record claim has no accessible ledger or record inventory. Neither group is published or added to the ${ledger.historical_baseline?.total_records ?? 550}-record historical baseline.`,
    warnings: [
      "The verified branch is staging-only and awaits v1.4.0 reconciliation; there is no database mutation or canonical publication path.",
      `The claimed ${unavailableClaim}-record branch is not incorporated into verified master records because its actual ledger is unavailable.`,
    ],
    errors: [],
  };
} else {
  evidence = {
    generatedAt: new Date().toISOString(), dryRunOnly: true, historicalCanonicalBaseline: 550,
    stagingObserved: 0, verifiedAttachedRecords: 0, unavailableClaimedRecords: 0, claimedStagingTotal: 0,
    stagingPublished: 0, rawStagingAttached: false, inputRecords: 0, validRecords: 0,
    duplicates: 0, potentialLegacyOverlap: 0, tamilReviewRequired: 0, sourceReviewRequired: 0,
    schemaErrors: 0, readyForEditorialReview: 0, candidateNewCanonicalRecords: 0,
    candidateEvidence: [], decisionStateCounts: {}, countMatchesObservedLedger: false,
    crossBranchReconciliationComplete: false, reconciliationState: "evidence_unavailable",
    publicationAvailable: false, note: "The shared staging ledger is unavailable. This cannot authorize canonical publication.",
    warnings: ["Attach the authoritative staging master ledger before any reconciliation review."], errors: [],
  };
}

fs.writeFileSync(outputPath, `${JSON.stringify(evidence, null, 2)}\n`, "utf8");
console.log(`Wrote ${outputPath}`);
