import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = '/home/ubuntu/ramaverse';
const required = [
  'RAMAVERSE_COMPLETE_UNIVERSE_BLUEPRINT.md',
  'RAMAVERSE_COVERAGE_MATRIX.json',
  'RAMAVERSE_MISSING_DATA_REGISTER.json',
  'RAMAVERSE_100_PERCENT_ROADMAP.md',
  'RAMAVERSE_DATASET_TARGETS.json',
  'RAMAVERSE_AGE_DEPTH_MODEL.md',
  'RAMAVERSE_TRADITION_GOVERNANCE_MODEL.md',
  'RAMAVERSE_COMPLETENESS_BLUEPRINT_STATE.json'
];
const read = (name) => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const hash = (name) => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, name))).digest('hex');
const blueprintState = read('RAMAVERSE_COMPLETENESS_BLUEPRINT_STATE.json');
const project = read('RAMAVERSE_PROJECT_STATE.json');
const coverage = read('RAMAVERSE_COVERAGE_MATRIX.json');
const missing = read('RAMAVERSE_MISSING_DATA_REGISTER.json');
const targets = read('RAMAVERSE_DATASET_TARGETS.json');
const protectedFiles = {
  project_state: 'RAMAVERSE_PROJECT_STATE.json',
  production_ledger: 'PRODUCTION_CORPUS_LEDGER_CORRECTED.json',
  frozen_mobile_pack_json: 'RAMAVERSE-CANONICAL-MOBILE-PACK-v1.4.0.json',
  route_matrix: 'PRODUCTION_ROUTE_MATRIX.json',
  translation_status: 'TRANSLATION_STATUS.json'
};
const checks = {
  required_files_present: required.every((file) => fs.existsSync(path.join(root, file))),
  domain_count_is_40: coverage.domains.length === 40,
  status_vocabulary_complete: ['COMPLETE', 'STRONG', 'PARTIAL', 'SHALLOW', 'MISSING', 'BLOCKED_BY_SOURCE', 'BLOCKED_BY_EDITORIAL_REVIEW'].every((status) => coverage.status_definitions.includes(status)),
  missing_register_has_critical_domains: missing.critical_missing_domains.length > 0,
  target_total_is_35950: targets.total_governed_records_target === 35950,
  canonical_baseline_preserved: project.historical_canonical_total === 550,
  staging_publication_preserved: project.staging_published === 0,
  blueprint_declares_no_canonical_change: blueprintState.canonical_modified === 0,
  blueprint_declares_no_mobile_change: blueprintState.mobile_pack_modified === 0,
  blueprint_declares_no_staging_publication: blueprintState.staging_published === 0,
  protected_input_hashes_unchanged: Object.entries(protectedFiles).every(([key, file]) => blueprintState.source_inputs[key] === hash(file))
};
const result = {
  validation_id: 'ramaverse-complete-universe-blueprint-validation-v1',
  validated_at: new Date().toISOString(),
  scope: 'RESEARCH_ARCHITECTURE_ONLY',
  checks,
  counts: {
    domains: coverage.domains.length,
    critical_missing_domains: missing.critical_missing_domains.length,
    high_priority_datasets: missing.high_priority_datasets.length,
    target_records: targets.total_governed_records_target,
    canonical_baseline: project.historical_canonical_total,
    staging_published: project.staging_published
  },
  valid: Object.values(checks).every(Boolean)
};
fs.writeFileSync(path.join(root, 'RAMAVERSE_COMPLETE_UNIVERSE_BLUEPRINT_VALIDATION.json'), `${JSON.stringify(result, null, 2)}\n`, 'utf8');
if (!result.valid) process.exitCode = 1;
console.log(JSON.stringify(result));
