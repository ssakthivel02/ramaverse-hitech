#!/usr/bin/env node
/**
 * Read-only, fail-closed physical staging inventory.
 * NEVER writes source files, mutates authority, or approves publication.
 * Usage: node scripts/validate_ayodhya_staging_inventory.mjs [--root <repo-dir>]
 */
import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const FILE = /^AYODHYA_S(\\d+)_SOURCE_BACKED_RECORDS\\.json$/;
const fromScript = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export function inspectBatches(batches, { enforceCompleteRange = true } = {}) {
  const findings = [];
  const seen = new Map();
  const families = { "21-52": 0, "53-65": 0, "66-95": 0 };
  let physicalRecords = 0;
  let quarantinedRecords = 0;
  const analyzed = new Set();
  const error = (file, code, detail) => findings.push({ file, code, detail });

  for (const { file, payload } of batches) {
    const match = FILE.exec(file);
    if (!match) { error(file, "UNEXPECTED_FILENAME", "Not a recognized Ayodhya staging batch"); continue; }
    const sarga = Number(match[1]);
    if (sarga < 21 || sarga > 95) { error(file, "OUT_OF_SCOPE", "Only Sargas 21–95 are supported"); continue; }
    if (analyzed.has(sarga)) { error(file, "DUPLICATE_SARGA_FILE", String(sarga)); continue; }
    analyzed.add(sarga);

    const family = sarga <= 52 ? "21-52" : sarga <= 65 ? "53-65" : "66-95";
    families[family]++;
    const isArray = Array.isArray(payload);
    if (family === "53-65" ? !isArray : isArray || !payload || typeof payload !== "object") {
      error(file, "WRONG_CONTAINER_SHAPE", family);
      continue;
    }
    const records = isArray ? payload : payload.records;
    if (!Array.isArray(records)) { error(file, "MISSING_RECORD_ARRAY", "records must be an array"); continue; }
    if (!isArray) {
      const key = family === "66-95" ? "recordsCount" : "recordCount";
      if (!Number.isSafeInteger(payload[key]) || payload[key] < 0) {
        error(file, "INVALID_DECLARED_COUNT", key);
      } else if (payload[key] !== records.length) {
        error(file, "COUNT_MISMATCH", `${key}=${payload[key]}; actual=${records.length}`);
      }
    }
    if (records.length === 0) error(file, "EMPTY_BATCH", "No records");

    for (let i = 0; i < records.length; i++) {
      physicalRecords++;
      const record = records[i];
      if (!record || typeof record !== "object" || Array.isArray(record)) {
        error(file, "INVALID_RECORD", String(i)); continue;
      }
      const idField = family === "66-95" ? "id" : "candidate_id";
      const sourceField = family === "66-95" ? "sourceIds" : "source_id";
      const id = record[idField];
      const source = record[sourceField];
      if (typeof id !== "string" || !id.trim()) {
        error(file, "MISSING_RECORD_ID", String(i));
      } else {
        const previous = seen.get(id);
        if (previous) error(file, "DUPLICATE_RECORD_ID", `${id} first found in ${previous}`);
        else seen.set(id, file);
      }
      const validSource = family === "66-95"
        ? Array.isArray(source) && source.length > 0 && source.every(s => typeof s === "string" && s.trim())
        : typeof source === "string" && source.trim();
      if (!validSource) error(file, "MISSING_SOURCE_REFERENCE", String(id ?? i));
      const recordSarga = record.sarga;
      if (recordSarga !== sarga) error(file, "SARGA_MISMATCH", `${id ?? i}: record=${recordSarga}; file=${sarga}`);
      const quarantine = family === "66-95"
        ? record.publicationState === "UNPUBLISHED_STAGING" && record.mergeState === "QUARANTINED_UNRECONCILED" && record.reviewState === "MACHINE_DRAFT_NEEDS_REVIEW"
        : record.publication_policy === "STAGING_QUARANTINE_ONLY";
      if (!quarantine) error(file, "PUBLICATION_GUARD_MISSING", String(id ?? i));
      else quarantinedRecords++;
    }
  }

  if (enforceCompleteRange) {
    for (let s = 21; s <= 95; s++) {
      if (!analyzed.has(s)) error(`AYODHYA_S${s}_SOURCE_BACKED_RECORDS.json`, "MISSING_BATCH", String(s));
    }
  }

  return {
    valid: findings.length === 0,
    filesChecked: analyzed.size,
    physicalRecords,
    quarantinedRecords,
    uniqueRecordIds: seen.size,
    families,
    findings
  };
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length !== 0 && (args.length !== 2 || args[0] !== "--root")) {
    throw new Error("Usage: node scripts/validate_ayodhya_staging_inventory.mjs [--root <repo-dir>]");
  }
  const root = args.length ? path.resolve(args[1]) : fromScript;
  const dir = path.join(root, "data/staging/post_v1");
  const files = (await readdir(dir)).filter(name => FILE.test(name)).sort((a, b) => Number(FILE.exec(a)[1]) - Number(FILE.exec(b)[1]));
  const batches = [];
  const parseFindings = [];
  for (const file of files) {
    try { batches.push({ file, payload: JSON.parse(await readFile(path.join(dir, file), "utf8")) }); }
    catch (err) { parseFindings.push({ file, code: "UNREADABLE_OR_INVALID_JSON", detail: String(err.message) }); }
  }
  const result = inspectBatches(batches);
  result.findings.unshift(...parseFindings);
  result.valid &&= parseFindings.length === 0;
  process.stdout.write(JSON.stringify(result, null, 2) + "\n");
  if (!result.valid) process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(err => { process.stderr.write(String(err.stack ?? err) + "\n"); process.exitCode = 2; });
}
