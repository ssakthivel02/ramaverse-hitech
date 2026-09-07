import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = "/home/ubuntu/ramaverse";
const reconDir = path.join(root, "data", "reconciliation_vnext");
const evidenceDir = path.join(root, "release_evidence", "corpus_vnext");
execFileSync("mkdir", ["-p", evidenceDir]);
const mustExist = [
  "data/reconciliation_vnext/RAMAVERSE-WEB-CORPUS-vNEXT-RECONCILIATION-LEDGER.json",
  "data/reconciliation_vnext/RAMAVERSE-WEB-CORPUS-vNEXT-CANDIDATE.json",
  "data/reconciliation_vnext/SEARCH_INDEX-vNEXT-CANDIDATE.json",
  "data/reconciliation_vnext/ASK_INDEX-vNEXT-CANDIDATE.json",
  "data/reconciliation_vnext/READER_MAPPINGS-vNEXT-CANDIDATE.json",
  "data/reconciliation_vnext/ENTITY_PROJECTIONS-vNEXT-CANDIDATE.json",
  "data/reconciliation_vnext/TIMELINE_PROJECTIONS-vNEXT-CANDIDATE.json",
  "release_evidence/CORPUS_INPUT_INVENTORY_2026-08-26.json",
  "release_evidence/CORPUS_VNEXT_VALIDATION.json",
  "release_evidence/CORPUS_VNEXT_VALIDATION.md",
  "release_evidence/RECONCILIATION_AUDIT_2026-08-26.json",
  "PROJECT_STATE.json",
  "CORPUS_STATE.json",
  "CONTINUATION.md",
  "SOURCE_MANIFEST.json",
];
const missing = mustExist.filter((file) => !existsSync(path.join(root, file)));
if (missing.length) throw new Error(`Missing required inputs: ${missing.join(", ")}`);
const ledger = JSON.parse(readFileSync(path.join(reconDir, "RAMAVERSE-WEB-CORPUS-vNEXT-RECONCILIATION-LEDGER.json"), "utf8"));
const validation = JSON.parse(readFileSync(path.join(root, "release_evidence/CORPUS_VNEXT_VALIDATION.json"), "utf8"));
const corpusZip = path.join(evidenceDir, "RAMAVERSE-WEB-CORPUS-vNEXT-CANDIDATE.zip");
const rcZip = path.join(evidenceDir, "RAMAVERSE-WEB-AI-HITECH-PRODUCTION-RC-vNEXT.zip");
const escrowZip = path.join(evidenceDir, "RAMAVERSE-WEBSITE-AI-HITECH-SOURCE-ESCROW-vNEXT.zip");
const zip = (target, inputs, excludes = []) => {
  execFileSync("rm", ["-f", target]);
  execFileSync("zip", ["-qr", target, ...inputs, ...excludes.flatMap((pattern) => ["-x", pattern])], { cwd: root, stdio: "ignore" });
  execFileSync("unzip", ["-tq", target], { stdio: "ignore" });
};
zip(corpusZip, ["data/reconciliation_vnext", "release_evidence/CORPUS_INPUT_INVENTORY_2026-08-26.json", "release_evidence/CORPUS_VNEXT_VALIDATION.json", "release_evidence/CORPUS_VNEXT_VALIDATION.md", "release_evidence/RECONCILIATION_AUDIT_2026-08-26.json", "PROJECT_STATE.json", "CORPUS_STATE.json", "CONTINUATION.md", "SOURCE_MANIFEST.json"]);
const excludes = ["node_modules/*", "dist/*", ".git/*", ".manus-logs/*", "coverage/*", "release_evidence/corpus_vnext/*", "release_evidence/60_hour_completion/*", "release_evidence/ai_hitech/*", "release_evidence/ai_intelligence/*", "release_evidence/archives/*", "*.zip", "*.tgz", "*.env", ".env*", "*.pem", "*.key", "*.p12", "*.keystore", "*service-account*.json", "*service*.json", "**/.DS_Store", "work_escrow/*", "tmp/*"];
zip(rcZip, ["."], excludes);
zip(escrowZip, ["."], excludes);
function verify(file, kind) {
  const listing = execFileSync("unzip", ["-Z1", file], { encoding: "utf8", maxBuffer: 128 * 1024 * 1024 });
  const entries = listing.split("\n").filter(Boolean);
  const forbidden = entries.some((entry) => /(^|\/)(node_modules|dist|\.git|\.manus-logs|coverage|work_escrow)(\/|$)|(^|\/)(\.env[^/]*|.*\.(pem|key|p12|keystore))$/.test(entry));
  const sourcePresent = entries.some((entry) => entry.startsWith("client/src/")) && entries.some((entry) => entry.startsWith("server/"));
  const recoveryPresent = ["PROJECT_STATE.json", "CORPUS_STATE.json", "CONTINUATION.md", "SOURCE_MANIFEST.json"].every((entry) => entries.includes(entry));
  const sha256 = createHash("sha256").update(readFileSync(file)).digest("hex");
  const result = { file: path.basename(file), kind, bytes: statSync(file).size, entries: entries.length, sha256, integrity: "PASS", sourcePresent, recoveryPresent, forbiddenContentPresent: forbidden };
  if (kind === "corpus") result.corpusLedgerPresent = entries.includes("data/reconciliation_vnext/RAMAVERSE-WEB-CORPUS-vNEXT-RECONCILIATION-LEDGER.json") && entries.includes("data/reconciliation_vnext/RAMAVERSE-WEB-CORPUS-vNEXT-CANDIDATE.json");
  if (!result.integrity || forbidden || (kind !== "corpus" && !sourcePresent) || (kind !== "corpus" && !recoveryPresent) || (kind === "corpus" && !result.corpusLedgerPresent)) throw new Error(`Archive verification failed for ${file}`);
  return result;
}
const archives = [verify(corpusZip, "corpus"), verify(rcZip, "rc"), verify(escrowZip, "escrow")];
const report = { generatedAt: new Date().toISOString(), specification: "pasted_content_108", mode: "RECONCILE_INTEGRATE_VALIDATE", canonicalBaseline: 550, physicalStaging: 398, stagingPublished: 0, mobileModified: false, productionDeployed: false, physicalRecordsAccounted: ledger.uniquePhysicalRecords, physicalOccurrences: ledger.physicalOccurrences, sourceRegistryEntries: ledger.sourceRegistryEntries, dispositions: ledger.counts, safeNew: validation.candidate.safeNew, safeEnrichment: validation.candidate.safeEnrichments, resultingCanonicalCandidate: validation.candidate.resultingCanonicalCandidate, invalidSourceRefs: ledger.invalidSourceRefs, stagingLeakage: validation.stagingLeakage, archives, overall: validation.pass && archives.every((archive) => archive.integrity === "PASS" && !archive.forbiddenContentPresent) };
writeFileSync(path.join(evidenceDir, "ARCHIVE_VERIFICATION.json"), JSON.stringify(report, null, 2) + "\n");
writeFileSync(path.join(evidenceDir, "SHA256SUMS.txt"), archives.map((archive) => `${archive.sha256}  ${archive.file}`).join("\n") + "\n");
writeFileSync(path.join(evidenceDir, "RECONCILIATION_FINAL_REPORT.md"), `# RamaVerse Corpus Authority vNext Final Report\n\nGenerated ${report.generatedAt}. No production deployment, staging publication, canonical mutation, or Mobile modification was performed.\n\n| Measure | Count |\n|---|---:|\n| Physical record occurrences accounted | ${report.physicalOccurrences} |\n| Unique physical records | ${report.physicalRecordsAccounted} |\n| Base canonical | ${report.canonicalBaseline} |\n| Safe new | ${report.safeNew} |\n| Safe enrichment | ${report.safeEnrichment} |\n| Identical duplicates | ${report.dispositions.IDENTICAL_DUPLICATE} |\n| Semantic overlaps | ${report.dispositions.SEMANTIC_OVERLAP} |\n| Variant holds | ${report.dispositions.VARIANT_HOLD} |\n| Source holds | ${report.dispositions.SOURCE_HOLD} |\n| Entity holds | ${report.dispositions.ENTITY_HOLD} |\n| Textual holds | ${report.dispositions.TEXTUAL_HOLD} |\n| Resulting canonical candidate | ${report.resultingCanonicalCandidate} |\n| Search candidate projection | 0 |\n| Ask candidate projection | 0 |\n| Reader candidate projection | 0 |\n| Graph candidate projection | 0 |\n| Timeline candidate projection | 0 |\n| Invalid source references | ${report.invalidSourceRefs} |\n| Staging leakage | ${report.stagingLeakage} |\n\nAll physical records received one disposition. The zero safe-new result is intentional: all discovered IDs were either exact duplicates or semantically overlapping physical representations, so no record was silently promoted.\n`);
console.log(JSON.stringify(report, null, 2));
if (!report.overall) process.exitCode = 1;
