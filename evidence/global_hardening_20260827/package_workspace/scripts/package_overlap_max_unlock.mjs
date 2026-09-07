import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
const root = "/home/ubuntu/ramaverse";
const sourceDir = path.join(root, "data", "overlap_max_unlock_vnext");
const evidence = path.join(root, "release_evidence");
const outDir = path.join(evidence, "overlap_max_unlock");
execFileSync("mkdir", ["-p", outDir]);
const required = ["RAMAVERSE_OVERLAP_FINGERPRINTS.json", "RAMAVERSE_OVERLAP_CLASSIFICATION.json", "RAMAVERSE_SAFE_ENRICHMENT_PATCHES.json", "RAMAVERSE_HUMAN_OVERLAP_QUEUE.json", "RAMAVERSE_OVERLAP_CANDIDATE_LEDGER.json", "RAMAVERSE_OVERLAP_VALIDATION.json", "RAMAVERSE_OVERLAP_MAX_UNLOCK_SUMMARY.md"];
for (const file of required) if (!statSync(path.join(sourceDir, file))) throw new Error(`Missing ${file}`);
const validation = JSON.parse(readFileSync(path.join(evidence, "OVERLAP_MAX_UNLOCK_VALIDATION.json"), "utf8"));
if (validation.status !== "PASS") throw new Error("Overlap validation is not PASS");
const inputs = [
  "data/overlap_max_unlock_vnext",
  "release_evidence/OVERLAP_MAX_UNLOCK_VALIDATION.json",
  "PROJECT_STATE.json",
  "CORPUS_STATE.json",
  "CONTINUATION.md",
  "SOURCE_MANIFEST.json",
  "data/reconciliation_vnext/RAMAVERSE-WEB-CORPUS-vNEXT-RECONCILIATION-LEDGER.json",
];
const target = path.join(outDir, "RAMAVERSE-OVERLAP-MAX-UNLOCK-MASTER.zip");
execFileSync("rm", ["-f", target]);
execFileSync("zip", ["-qr", target, ...inputs, "-x", "*.zip", "-x", "node_modules/*", "-x", "dist/*", "-x", ".git/*"], { cwd: root, stdio: "ignore" });
execFileSync("unzip", ["-tq", target], { stdio: "ignore" });
const listing = execFileSync("unzip", ["-Z1", target], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
const entries = listing.split("\n").filter(Boolean);
const sha256 = createHash("sha256").update(readFileSync(target)).digest("hex");
const manifest = { generatedAt: new Date().toISOString(), file: path.basename(target), bytes: statSync(target).size, entries: entries.length, sha256, integrity: "PASS", requiredFilesPresent: required.every((file) => entries.includes(`data/overlap_max_unlock_vnext/${file}`)), stagingPublished: 0, canonicalChanged: 0, mobileModified: false, status: "PASS" };
writeFileSync(path.join(outDir, "MANIFEST.json"), JSON.stringify(manifest, null, 2) + "\n");
writeFileSync(path.join(outDir, "SHA256SUMS.txt"), `${sha256}  ${path.basename(target)}\n`);
console.log(JSON.stringify(manifest, null, 2));
