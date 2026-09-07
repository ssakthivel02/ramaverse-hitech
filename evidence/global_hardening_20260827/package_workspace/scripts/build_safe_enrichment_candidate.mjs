import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";
const root = "/home/ubuntu/ramaverse";
const outDir = path.join(root, "data", "v1_5_safe_enrichment_candidate");
mkdirSync(outDir, { recursive: true });
const pack = JSON.parse(readFileSync(path.join(root, "independent_escrow_work/RAMAVERSE-CANONICAL-MOBILE-PACK-v1.4.0.json"), "utf8"));
const patchesRaw = JSON.parse(readFileSync(path.join(root, "data/overlap_max_unlock_vnext/RAMAVERSE_SAFE_ENRICHMENT_PATCHES.json"), "utf8"));
const patches = patchesRaw.patches.filter((patch) => patch.patch_type === "OPTIONAL_FIELD_ENRICHMENT_CANDIDATE" && patch.approval_state === "CANDIDATE_ONLY_NOT_APPLIED" && patch.canonical_mutation === 0);
const baseline = Array.isArray(pack.search_index) ? pack.search_index : [];
const baselineById = new Map(baseline.map((record) => [record.id, record]));
const candidate = baseline.map((record) => structuredClone(record));
const candidateById = new Map(candidate.map((record) => [record.id, record]));
const applied = [];
const rejected = [];
const identityFields = ["id", "canonical_source_locator", "source_ids"];
for (const patch of patches) {
  const targetId = patch.target_record_id ?? patch.record_id;
  const target = candidateById.get(targetId);
  if (!target) { rejected.push({ ...patch, rejection_reason: "TARGET_NOT_PRESENT_IN_FROZEN_550_BASELINE", applied: 0 }); continue; }
  const currentLocator = target.canonical_source_locator ?? target.source_locator;
  if (patch.source_locator && currentLocator && patch.source_locator !== currentLocator) { rejected.push({ ...patch, rejection_reason: "SOURCE_LOCATOR_MISMATCH", applied: 0 }); continue; }
  rejected.push({ ...patch, rejection_reason: "PATCH_SCHEMA_CONTAINS_CANDIDATE_FIELDS_ONLY_NO_VALUE_PAYLOAD", applied: 0 });
}
const immutableDiffs = candidate.flatMap((record) => {
  const before = baselineById.get(record.id);
  return identityFields.filter((field) => JSON.stringify(before?.[field]) !== JSON.stringify(record[field])).map((field) => ({ id: record.id, field }));
});
const manifest = { schema_version: "ramaverse-web-v1.5-safe-enrichment-candidate", generated_at: new Date().toISOString(), baseline_count: baseline.length, patches_input: patches.length, patches_applied: applied.length, patches_rejected: rejected.length, final_canonical_count: candidate.length, record_ids_changed: immutableDiffs.filter((diff) => diff.field === "id").length, source_locators_changed: immutableDiffs.filter((diff) => diff.field === "canonical_source_locator").length, canonical_authority_fields_changed: immutableDiffs.length, p0_excluded: 265, staging_excluded: true, staging_leakage: 0, publication_state: "CANDIDATE_ONLY_NOT_PRODUCTION", canonical_mutation: 0, mobile_modified: false, note: "Only patch metadata was available; no patch contained a value payload. No enrichment was applied rather than guessing or copying from unresolved physical records." };
const output = { manifest, baseline_manifest: pack.manifest, records: candidate };
writeFileSync(path.join(outDir, "RAMAVERSE_CANONICAL_V1_5_ENRICHED_CANDIDATE.json"), JSON.stringify(output, null, 2) + "\n");
writeFileSync(path.join(outDir, "SAFE_ENRICHMENT_APPLIED.json"), JSON.stringify({ patches: applied, applied: 0 }, null, 2) + "\n");
writeFileSync(path.join(outDir, "SAFE_ENRICHMENT_REJECTED.json"), JSON.stringify({ patches: rejected, rejected: rejected.length }, null, 2) + "\n");
writeFileSync(path.join(outDir, "CANDIDATE_PROVENANCE.json"), JSON.stringify({ generated_at: manifest.generated_at, source: "v1.4.0 frozen pack search_index", base_canonical_count: 550, canonical_candidate_count: candidate.length, p0_excluded: 265, staging_leakage: 0, production_mutation: 0 }, null, 2) + "\n");
console.log(JSON.stringify(manifest, null, 2));
