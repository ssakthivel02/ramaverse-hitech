import crypto from 'node:crypto';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const root = '/home/ubuntu/ramaverse/';
const read = (rel) => JSON.parse(fs.readFileSync(root + rel, 'utf8'));
const write = (rel, value) => fs.writeFileSync(root + rel, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
const postV1 = 'data/staging/post_v1/';
const files = fs.readdirSync(root + postV1).filter((file) => /^AYODHYA_S\d+_SOURCE_BACKED_RECORDS\.json$/.test(file)).sort((a, b) => Number(a.match(/S(\d+)/)[1]) - Number(b.match(/S(\d+)/)[1]));
const batches = Object.fromEntries(files.map((file) => [file, read(postV1 + file)]));
const staging = [...read('data/staging/physical/STAGING_RECORDS.json'), ...Object.values(batches).flatMap((batch) => batch.records)];
const ledger = read('RAMAVERSE_STAGING_MASTER_LEDGER_V12.json');
const sources = read('SOURCE_LEDGER_V12.json').sources;
const queue = read('TAMIL_EDITORIAL_REVIEW_QUEUE_V12.json');
const state = read('RAMAVERSE_PROJECT_STATE.json');
const crosswalk = read('VERSE_NUMBERING_CROSSWALK_V12.json');
const sourceIds = new Set(sources.map((source) => source.source_id));
const ids = staging.map((record) => record.candidate_id);
const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
const required = ['candidate_id', 'record_type', 'kanda', 'sarga', 'verse_locator', 'source_id', 'source_locator', 'source_type', 'tradition_classification', 'english_explanation', 'tamil_draft', 'tamil_review_status', 'confidence', 'merge_state', 'possible_legacy_overlap', 'publication_policy'];
const missingRequiredFields = staging.filter((record) => record.candidate_id.startsWith('stg-postv1-') && required.some((field) => record[field] === undefined || record[field] === null || record[field] === '')).map((record) => record.candidate_id);
const missingSourceIds = [...new Set(staging.flatMap((record) => [record.source_id, ...(record.crosscheck_source_ids ?? [])]).filter((id) => id && !id.startsWith('NOT_AVAILABLE') && !sourceIds.has(id)))];
const newFiles = ['AYODHYA_S49_SOURCE_BACKED_RECORDS.json', 'AYODHYA_S50_SOURCE_BACKED_RECORDS.json', 'AYODHYA_S51_SOURCE_BACKED_RECORDS.json', 'AYODHYA_S52_SOURCE_BACKED_RECORDS.json'];
const batchCountMismatches = newFiles.filter((file) => batches[file].recordCount !== batches[file].records.length).map((file) => ({ file, declared: batches[file].recordCount, actual: batches[file].records.length }));
const newRecords = newFiles.flatMap((file) => batches[file].records);
const nonQuarantine = staging.filter((record) => record.publication_policy !== 'STAGING_QUARANTINE_ONLY').map((record) => record.candidate_id);
const mobilePath = '/home/ubuntu/RAMAVERSE-CANONICAL-MOBILE-PACK-v1.4.0-FINAL-v2.zip';
const mobileArchiveHash = fs.existsSync(mobilePath) ? crypto.createHash('sha256').update(fs.readFileSync(mobilePath)).digest('hex') : null;
const mobileManifest = fs.existsSync(mobilePath) ? JSON.parse(execFileSync('unzip', ['-p', mobilePath, 'RAMAVERSE-CANONICAL-MOBILE-PACK-v1.4.0.json'], { encoding: 'utf8' })) : null;
const checks = {
  canonical_baseline_unchanged: state.historical_canonical_total === 550,
  physical_ledger_match: staging.length === ledger.physicallyAvailableUniqueRecords,
  duplicate_ids_zero: duplicateIds.length === 0,
  new_batch_payloads_present: newFiles.every((file) => Array.isArray(batches[file].records) && batches[file].records.length > 0),
  required_post_v1_fields_complete: missingRequiredFields.length === 0,
  source_references_resolve: missingSourceIds.length === 0,
  staging_quarantine_only: nonQuarantine.length === 0,
  staging_published_zero: state.staging_published === 0 && ledger.stagingPublished === 0,
  public_search_and_ask_isolation: ledger.publicSurfacePolicy.search === 'CANONICAL_ONLY' && ledger.publicSurfacePolicy.ask === 'CANONICAL_ONLY' && ledger.publicSurfacePolicy.stagingExposure === 0,
  tamil_human_reviewed_zero: queue.humanReviewedCount === 0 && queue.records.every((record) => record.human_reviewed === false),
  continuation_exact: state.exact_next_point === 'Ayodhya Kanda Sarga 53, verse 2.53.1',
  s50_variance_recorded: crosswalk.cases.some((item) => item.case_id === 'ayodhya-s50-sn-rr'),
  frozen_mobile_reference_contract: mobileManifest === null || (mobileManifest.manifest?.checksums?.pack_sha256 === '938a25d4acee4be69badec749b8a2a1dd7a689c9b7ef90ad9182f6092549f049' && mobileManifest.manifest?.historical_canonical_baseline === 550 && mobileManifest.manifest?.staging_published === 0 && mobileManifest.search_index?.length === 550)
};
const result = { validation_id: 'ramaverse-sequential-v12-s49-s52', generated_at: new Date().toISOString(), start_physical: 353, new_records: newRecords.length, final_physical: staging.length, final_ledger: ledger.physicallyAvailableUniqueRecords, checks, duplicate_ids: duplicateIds, missing_required_fields: missingRequiredFields, missing_source_ids: missingSourceIds, non_quarantine_records: nonQuarantine, batch_count_metadata_warnings: batchCountMismatches, source_count: sources.length, tamil_human_reviewed: queue.humanReviewedCount, next_exact_source: 'Ayodhya Kanda / Sarga 53 / 2.53.1', mobile_reference_evidence: mobileManifest ? { checked: true, archive_sha256: mobileArchiveHash, manifest_pack_sha256: mobileManifest.manifest?.checksums?.pack_sha256, historical_canonical_baseline: mobileManifest.manifest?.historical_canonical_baseline, staging_published: mobileManifest.manifest?.staging_published, search_index_length: mobileManifest.search_index?.length, note: 'Archive wrapper hash is not the canonical pack-content hash. The frozen manifest contract is used as reference-only evidence.' } : { checked: false, reason: 'Frozen archive unavailable locally; authoritative reference hash retained.' }, valid: Object.values(checks).every(Boolean) };
write('VALIDATION_SEQUENTIAL_V12.json', result);
if (!result.valid) process.exitCode = 1;
console.log(JSON.stringify(result));
