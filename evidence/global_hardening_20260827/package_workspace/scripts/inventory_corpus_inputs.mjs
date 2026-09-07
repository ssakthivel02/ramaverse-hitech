import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = "/home/ubuntu/ramaverse";
const run = (command, args, options = {}) => execFileSync(command, args, { cwd: root, encoding: "utf8", maxBuffer: 128 * 1024 * 1024, ...options });
const files = run("find", ["data", "-type", "f", "-iname", "*.json"], { stdio: ["ignore", "pipe", "ignore"] }).trim().split("\n").filter(Boolean).sort();
const datasets = [];
for (const relative of files) {
  const absolute = path.join(root, relative);
  let value;
  try { value = JSON.parse(readFileSync(absolute, "utf8")); } catch { continue; }
  const arrays = [];
  if (Array.isArray(value)) arrays.push({ key: "$", records: value });
  if (value && typeof value === "object") {
    for (const [key, candidate] of Object.entries(value)) if (Array.isArray(candidate) && candidate.some((item) => item && typeof item === "object" && (item.record_id || item.recordId || item.id))) arrays.push({ key, records: candidate });
  }
  for (const array of arrays) {
    const records = array.records.filter((item) => item && typeof item === "object" && (item.record_id || item.recordId || item.id));
    if (!records.length) continue;
    const ids = records.map((item) => item.record_id ?? item.recordId ?? item.id);
    datasets.push({ file: relative, array: array.key, records: records.length, uniqueIds: new Set(ids).size, duplicateIds: records.length - new Set(ids).size, sampleIds: ids.slice(0, 3), sha256: createHash("sha256").update(readFileSync(absolute)).digest("hex") });
  }
}
const zipFiles = run("find", ["data/staging", "-type", "f", "-iname", "*.zip"], { stdio: ["ignore", "pipe", "ignore"] }).trim().split("\n").filter(Boolean).sort();
const archives = zipFiles.map((relative) => {
  const absolute = path.join(root, relative);
  run("unzip", ["-tq", absolute], { stdio: "ignore" });
  const entries = Number(run("sh", ["-c", `unzip -Z1 "$1" | awk 'NF{n++} END{print n+0}'`, "sh", absolute]).trim());
  return { file: relative, bytes: statSync(absolute).size, entries, sha256: createHash("sha256").update(readFileSync(absolute)).digest("hex"), integrity: "PASS" };
});
const report = { generatedAt: new Date().toISOString(), sourceRoot: root, canonicalBaseline: 550, currentWebsiteStaging: 398, stagingPublished: 0, datasets, archives, notes: ["This is an inventory only; no records were promoted, merged, or rewritten.", "ZIP integrity was tested for every data/staging archive."] };
const out = path.join(root, "release_evidence", "CORPUS_INPUT_INVENTORY_2026-08-26.json");
writeFileSync(out, JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify({ output: out, datasetCount: datasets.length, archiveCount: archives.length, datasets, archives }, null, 2));
