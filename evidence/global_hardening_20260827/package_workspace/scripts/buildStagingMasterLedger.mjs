import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const stagingDir = path.join(root, "data", "staging", "physical");
const recordsPath = path.join(stagingDir, "STAGING_RECORDS.json");
const inheritedLedgerPath = path.join(stagingDir, "STAGING_MASTER_LEDGER.json");
const outputPath = path.join(root, "RAMAVERSE_STAGING_MASTER_LEDGER.json");
const reportPath = path.join(root, "RAMAVERSE_STAGING_CONFLICT_REPORT.md");

const artifactRole = {
  "STAGING_RECORDS.json": "candidate_record_payload",
  "STAGING_MASTER_LEDGER.json": "inherited_branch_ledger",
  "CONTINUATION_STATE.json": "continuation_claims_and_blockers",
  "DUPLICATE_AUDIT.json": "inherited_duplicate_audit",
  "RECONCILIATION_QUEUE.csv": "reconciliation_queue",
  "SOURCE_REGISTRY_STAGING.csv": "staging_source_registry",
  "TAMIL_REVIEW_QUEUE.csv": "tamil_editorial_queue",
  "STAGING_BRANCH_RECONCILIATION_REPORT.md": "inherited_branch_report",
  "RAMAVERSE_STAGING_V2_CONTINUATION.md": "verified_branch_continuation",
  "RAMAVERSE-STAGING-MASTER-20260814T161302Z.zip": "source_archive_container",
  "CHECKPOINT_MANIFEST.json": "source_checkpoint_manifest",
  "SHA256SUMS.txt": "source_checksum_evidence",
  "SOURCE_CONTINUITY_BLOCKER.md": "source_continuity_blocker",
  "ramaverse_canonical_staging_v2.json": "canonical_staging_payload",
};
const artifactInventory = fs.readdirSync(stagingDir, { withFileTypes: true }).filter((entry) => entry.isFile()).sort((left, right) => left.name.localeCompare(right.name)).map((entry) => {
  const filePath = path.join(stagingDir, entry.name);
  return { file: path.relative(root, filePath), role: artifactRole[entry.name] ?? "unclassified_physical_artifact", bytes: fs.statSync(filePath).size, sha256: crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex") };
});
const sourceArchive = artifactInventory.find((artifact) => artifact.role === "source_archive_container");
const archiveMemberInventory = sourceArchive ? execFileSync("unzip", ["-Z1", path.join(root, sourceArchive.file)], { encoding: "utf8" }).split("\n").filter(Boolean).map((member) => ({
  member,
  origin: sourceArchive.file,
  role: artifactRole[path.basename(member)] ?? "archive_member_reference",
})) : [];

if (!fs.existsSync(recordsPath) || !fs.existsSync(inheritedLedgerPath)) {
  throw new Error("Physical staging inputs are missing. Do not synthesize a master ledger.");
}

const records = JSON.parse(fs.readFileSync(recordsPath, "utf8"));
const inherited = JSON.parse(fs.readFileSync(inheritedLedgerPath, "utf8"));
if (!Array.isArray(records)) throw new Error("STAGING_RECORDS.json must contain a record array.");

const grouped = Map.groupBy(records, (record) => record.candidate_id);
const duplicateCandidateIds = [...grouped.entries()].filter(([, entries]) => entries.length > 1).map(([candidateId]) => candidateId);
const sortSarga = (record) => Number((record.candidate_id.match(/-s(\d+)-/)?.[1] ?? record.sarga_reference.match(/2\.(\d+)/)?.[1] ?? "0"));
const latestRecord = records.slice().sort((left, right) => sortSarga(right) - sortSarga(left))[0] ?? null;
const sourceHashes = [recordsPath, inheritedLedgerPath].map((filePath) => ({
  file: path.relative(root, filePath),
  sha256: crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex"),
}));

const declaredUnavailable = [
  { claimId: "CLAIM-2026-08-14-50", declaredRecords: 50, declaredCoverage: "All seven Kandas / Uttara continuation", declaredLatestSarga: null, declaredNextAcquisition: "Uttara Kanda Chapter 95", origin: "CONTINUATION_STATE.json", artifactAvailable: false },
  { claimId: "CLAIM-2026-08-15-97", declaredRecords: 97, declaredCoverage: "Ayodhya Kanda through Sarga 24", declaredLatestSarga: "Ayodhya Kanda Sarga 24", declaredNextAcquisition: "Ayodhya Kanda Sarga 25", origin: "pasted_content_7.txt", artifactAvailable: false },
  { claimId: "CLAIM-2026-08-15-S25-DELTA", declaredRecords: 17, declaredCoverage: "Ayodhya Kanda Sarga 25 delta", declaredLatestSarga: "Ayodhya Kanda Sarga 25", declaredNextAcquisition: "Ayodhya Kanda Sarga 26", origin: "pasted_content_7.txt", artifactAvailable: false },
  { claimId: "CLAIM-2026-08-15-109", declaredRecords: 109, declaredCoverage: "Declared cumulative staging total", declaredLatestSarga: "Ayodhya Kanda Sarga 25", declaredNextAcquisition: "Ayodhya Kanda Sarga 26", origin: "pasted_content_7.txt", artifactAvailable: false },
];

const masterRecords = records.map((record) => ({
  candidate_id: record.candidate_id,
  record_type: record.record_type,
  kanda: record.kanda,
  sarga: record.sarga_reference,
  source_ids: record.source ?? [],
  origin_file: "data/staging/physical/STAGING_RECORDS.json",
  branch: inherited.verified_branch?.branch_id ?? "ayodhya_v2_verified",
  review_status: record.review_status ?? "not_recorded",
  merge_state: record.merge_state ?? "not_recorded",
  possible_legacy_overlap: Boolean(record.possible_legacy_overlap),
}));

const ledger = {
  ledgerId: "ramaverse-website-staging-master-v3",
  generatedAt: new Date().toISOString(),
  mode: "non_mutating_physical_artifact_inventory",
  historicalCanonicalBaseline: 550,
  stagingPublished: 0,
  physicallyAvailableUniqueRecords: masterRecords.length,
  physicallyAvailableArtifacts: sourceHashes,
  artifactInventory,
  archiveMemberInventory,
  declaredButUnavailableClaims: declaredUnavailable,
  duplicates: { candidateIds: duplicateCandidateIds, count: duplicateCandidateIds.length },
  conflicts: [
    "The physical 28-record branch through Ayodhya Sarga 20 does not establish a relationship to the separately declared 50-, 97-, 17-, or 109-record claims.",
    "Declared cumulative counts cannot be added, deduplicated, or promoted without their physical ledgers and candidate IDs.",
  ],
  latestVerifiedSarga: latestRecord ? { sarga: `Ayodhya Kanda Sarga ${sortSarga(latestRecord)}`, evidence: "physical staging record locator", status: "STAGING_NEEDS_RECONCILIATION" } : null,
  nextAcquisitionPoint: { sarga: "Ayodhya Kanda Sarga 21", basis: "physical verified-branch continuation", status: "SOURCE_REVIEW_PENDING" },
  records: masterRecords,
};

fs.writeFileSync(outputPath, `${JSON.stringify(ledger, null, 2)}\n`);
const typeCounts = Object.entries(Object.groupBy(masterRecords, (record) => record.record_type)).map(([type, entries]) => `| ${type} | ${entries.length} |`).join("\n");
fs.writeFileSync(reportPath, `# RamaVerse Staging Conflict Report\n\nGenerated: ${ledger.generatedAt}\n\n## Non-negotiable outcome\n\nThe historical canonical baseline remains **550**. Physical staging records remain **unpublished**. This report inventories files only; it does not reconcile, merge, or infer content.\n\n| Measure | Finding |\n|---|---:|\n| Physically available unique staging records | ${ledger.physicallyAvailableUniqueRecords} |\n| Physically available artifacts | ${artifactInventory.length} |\n| ZIP members inventoried | ${archiveMemberInventory.length} |\n| Physically available duplicates | ${ledger.duplicates.count} |\n| Potential legacy overlap flags | ${masterRecords.filter((record) => record.possible_legacy_overlap).length} |\n| Staging published | 0 |\n| Latest verified physical staging Sarga | ${ledger.latestVerifiedSarga?.sarga ?? "Unavailable"} |\n| Next physical-branch acquisition point | ${ledger.nextAcquisitionPoint.sarga} |\n\n## Artifact inventory\n\n| Physical artifact | Role | Bytes |\n|---|---|---:|\n${artifactInventory.map((artifact) => `| ${artifact.file} | ${artifact.role} | ${artifact.bytes} |`).join("\n")}\n\n## Archive-member inventory\n\n| Member | Origin | Role |\n|---|---|---|\n${archiveMemberInventory.map((member) => `| ${member.member} | ${member.origin} | ${member.role} |`).join("\n")}\n\n## Declared but unavailable branches\n\n| Claim | Declared records | Coverage | Origin |\n|---|---:|---|---|\n${declaredUnavailable.map((claim) => `| ${claim.claimId} | ${claim.declaredRecords} | ${claim.declaredCoverage} | ${claim.origin} |`).join("\n")}\n\nThese claims are intentionally not summed: their overlap, candidate IDs, and source evidence are unavailable.\n\n## Physical record types\n\n| Type | Physical records |\n|---|---:|\n${typeCounts}\n\n## Conflict resolution status\n\n> **Blocked pending physical ledgers.** The 28-record verified branch can be reviewed only against a supplied candidate-level ledger. The declared 50, 97, 17, and 109 totals are not substitutes for physical records.\n\n## Required next input\n\nAttach the raw branch ledgers (including candidate IDs, source IDs, Sarga references, and review/merge states) for each declaration. Until then, RamaVerse must retain all staging outside canonical search, reader navigation, production counts, and offline canonical content.\n`);
console.log(`Wrote ${outputPath} and ${reportPath} from ${masterRecords.length} physical staging records.`);
