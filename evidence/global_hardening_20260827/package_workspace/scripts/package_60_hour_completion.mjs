import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = "/home/ubuntu/ramaverse";
const evidenceDir = path.join(root, "release_evidence");
const packageDir = path.join(evidenceDir, "60_hour_completion");
execFileSync("mkdir", ["-p", packageDir]);

const requiredEvidence = [
  "PROJECT_STATE.json",
  "CONTINUATION.md",
  "SOURCE_MANIFEST.json",
  "CORPUS_STATE.json",
  "LANGUAGE_STATE.json",
  "FEATURE_MATRIX.json",
  "ROUTE_MATRIX.json",
  "RECOVERY.md",
  "DEPLOYMENT.md",
  "release_evidence/PHYSICAL_AUTHORITY_SNAPSHOT_2026-08-25.json",
  "release_evidence/PREMIUM_COMPLETION_VALIDATION.json",
  "release_evidence/PREMIUM_COMPLETION_VALIDATION.md",
  "release_evidence/PERFORMANCE_VALIDATION.json",
  "release_evidence/VISUAL_VERIFICATION_2026-08-25.md",
  "release_evidence/visual_assets/VISUAL_ASSET_MANIFEST.json",
  "release_evidence/visual_assets/kanda-identities.svg",
  "release_evidence/visual_assets/journey-source-offline.svg",
  "release_evidence/visual_assets/child-learning.svg",
  "client/public/manifest.json",
  "client/public/robots.txt",
  "client/public/sitemap.xml",
  "client/public/sw.js",
  "client/public/favicon.svg",
];
const missingEvidence = requiredEvidence.filter((file) => !existsSync(path.join(root, file)));
if (missingEvidence.length) throw new Error(`Missing required evidence: ${missingEvidence.join(", ")}`);

const hashLines = requiredEvidence.map((relative) => `${createHash("sha256").update(readFileSync(path.join(root, relative))).digest("hex")}  ${relative}`);
writeFileSync(path.join(root, "SHA256SUMS.txt"), hashLines.join("\n") + "\n");

const rc = path.join(packageDir, "RAMAVERSE-WEBSITE-PREMIUM-COMPLETE-SOURCE-RC.zip");
const escrow = path.join(packageDir, "RAMAVERSE-WEBSITE-PREMIUM-COMPLETE-SOURCE-ESCROW.zip");
const exclude = [
  "node_modules/*",
  "dist/*",
  ".git/*",
  ".manus-logs/*",
  ".cache/*",
  "coverage/*",
  "release_evidence/60_hour_completion/*",
  "*.zip",
  "*.tgz",
  "*.env",
  ".env*",
  "*.pem",
  "*.key",
  "*.p12",
  "*.keystore",
  "*service-account*.json",
  "*service*.json",
  "**/.DS_Store",
  "work_escrow/*",
  "tmp/*",
];
const zipArgs = (target) => ["-qr", target, ".", ...exclude.flatMap((pattern) => ["-x", pattern])];
for (const target of [rc, escrow]) {
  execFileSync("rm", ["-f", target]);
  execFileSync("zip", zipArgs(target), { cwd: root, stdio: "ignore" });
  execFileSync("unzip", ["-tq", target], { stdio: "ignore" });
}

function verifyArchive(file) {
  const listing = execFileSync("unzip", ["-Z1", file], { encoding: "utf8", maxBuffer: 128 * 1024 * 1024 });
  const entries = listing.split("\n").filter(Boolean);
  const sha256 = createHash("sha256").update(readFileSync(file)).digest("hex");
  const hasSource = entries.some((entry) => entry.startsWith("client/src/")) && entries.some((entry) => entry.startsWith("server/"));
  const hasRecovery = ["PROJECT_STATE.json", "CONTINUATION.md", "RECOVERY.md", "DEPLOYMENT.md", "SHA256SUMS.txt"].every((entry) => entries.includes(entry));
  const hasValidation = entries.includes("release_evidence/PREMIUM_COMPLETION_VALIDATION.json") && entries.includes("release_evidence/PERFORMANCE_VALIDATION.json");
  const hasVisualPack = entries.includes("release_evidence/visual_assets/VISUAL_ASSET_MANIFEST.json");
  const excludedLeak = entries.some((entry) => /(^|\/)(node_modules|dist|\.git|\.manus-logs|coverage|work_escrow)(\/|$)/.test(entry) || /(^|\/)(\.env[^/]*|.*\.pem|.*\.key|.*\.keystore)$/.test(entry));
  return { file: path.basename(file), bytes: statSync(file).size, sha256, entries: entries.length, integrity: "PASS", sourcePresent: hasSource, recoveryDocsPresent: hasRecovery, validationPresent: hasValidation, visualPackPresent: hasVisualPack, forbiddenContentPresent: excludedLeak };
}

const verification = {
  generatedAt: new Date().toISOString(),
  specification: "pasted_content_107",
  mode: "BACKUP_AND_RELEASE_PACKAGING_ONLY",
  sourceRoot: root,
  sourceVersion: "56bb0d6+working-tree-2026-08-25",
  canonicalBaseline: 550,
  physicalStaging: 398,
  stagingPublished: 0,
  mobileModified: false,
  productionDeployed: false,
  requiredEvidence,
  missingEvidence,
  archives: [verifyArchive(rc), verifyArchive(escrow)],
  excluded: ["node_modules", "dist", ".git", ".manus-logs", "coverage", "work_escrow", "old ZIP archives", "credentials", "tokens", "temporary output"],
};
verification.pass = verification.missingEvidence.length === 0 && verification.archives.every((archive) => archive.integrity === "PASS" && archive.sourcePresent && archive.recoveryDocsPresent && archive.validationPresent && archive.visualPackPresent && !archive.forbiddenContentPresent);
writeFileSync(path.join(packageDir, "60_HOUR_ARCHIVE_VERIFICATION.json"), JSON.stringify(verification, null, 2) + "\n");
writeFileSync(path.join(packageDir, "SHA256SUMS.txt"), verification.archives.map((archive) => `${archive.sha256}  ${archive.file}`).join("\n") + "\n");
writeFileSync(path.join(packageDir, "60_HOUR_COMPLETION_REPORT.md"), `# RamaVerse Website — 60-Hour Completion Program\n\nGenerated ${verification.generatedAt}. Deployment was not performed.\n\n| Gate | Result |\n|---|---|\n| Source RC integrity | ${verification.archives[0].integrity} |\n| Source escrow integrity | ${verification.archives[1].integrity} |\n| Source tree present | ${verification.archives.every((archive) => archive.sourcePresent) ? "PASS" : "FAIL"} |\n| Recovery docs present | ${verification.archives.every((archive) => archive.recoveryDocsPresent) ? "PASS" : "FAIL"} |\n| Visual pack present | ${verification.archives.every((archive) => archive.visualPackPresent) ? "PASS" : "FAIL"} |\n| Forbidden content absent | ${verification.archives.every((archive) => !archive.forbiddenContentPresent) ? "PASS" : "FAIL"} |\n| Canonical baseline | ${verification.canonicalBaseline} |\n| Physical staging | ${verification.physicalStaging} |\n| Staging publication | ${verification.stagingPublished} |\n| Mobile modified | ${verification.mobileModified ? "YES" : "NO"} |\n\n## Authority boundary\n\nThe current Website work records a continuation conflict and does not acquire, promote, or publish corpus records.\n`);
console.log(JSON.stringify(verification, null, 2));
if (!verification.pass) process.exitCode = 1;
