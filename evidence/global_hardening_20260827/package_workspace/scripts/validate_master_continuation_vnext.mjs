import fs from 'node:fs';
import path from 'node:path';

const packageRoot = process.argv[2] ?? '/tmp/ramaverse-master-continuation-2026-08-vnext';
const read = (rel) => JSON.parse(fs.readFileSync(path.join(packageRoot, rel), 'utf8'));
const requiredDirs = ['01_CORPUS_AUTHORITY', '02_SEQUENTIAL_STAGING', '03_CHARACTERS', '04_DIALOGUES_DHARMA', '05_PLACES_JOURNEYS', '06_DEVOTION', '07_TEMPLES_TRADITIONS', '08_TAMIL_EDITORIAL', '09_TEXTUAL_VARIANTS', '10_LANGUAGES', '11_KNOWLEDGE_UNIVERSE_BLUEPRINT', '12_MOBILE_POST_VC11', '13_MOBILE_QA', '14_CORPUS_SYNC', '15_VALIDATION', '16_CONTINUATION', '17_CHECKSUMS'];
const requiredFiles = ['RAMAVERSE_MASTER_STATE.json', 'RAMAVERSE_MASTER_LEDGER.json', 'RAMAVERSE_DATASET_INVENTORY.json', 'RAMAVERSE_SOURCE_LEDGER_MASTER.json', 'RAMAVERSE_COVERAGE_MATRIX_MASTER.json', 'RAMAVERSE_UNRESOLVED_ITEMS.json', 'RAMAVERSE_NEXT_ACTIONS.md', 'CONTINUATION.md'];
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const full = path.join(dir, entry.name);
  return entry.isDirectory() ? walk(full) : [full];
});
const state = read('RAMAVERSE_MASTER_STATE.json');
const ledger = read('RAMAVERSE_MASTER_LEDGER.json');
const files = walk(packageRoot).map((file) => path.relative(packageRoot, file).replaceAll('\\', '/'));
const continuation = fs.readFileSync(path.join(packageRoot, 'CONTINUATION.md'), 'utf8');
const sensitive = /(\.env($|\.)|credentials|token|service[-_]?account|google.*\.json|node_modules|(^|\/)dist\/|(^|\/)\.git\/)/i;
const checks = {
  all_required_directories_present: requiredDirs.every((dir) => fs.existsSync(path.join(packageRoot, dir))),
  all_required_master_files_present: requiredFiles.every((file) => fs.existsSync(path.join(packageRoot, file))),
  physical_ledger_match: state.physical_staging_count === state.ledger_count && ledger.staging_layer.physical_count === ledger.staging_layer.ledger_count,
  unique_ids_match_physical: state.unique_ids === state.physical_staging_count,
  duplicates_zero: state.duplicates === 0 && ledger.staging_layer.duplicate_ids.length === 0,
  source_resolution_complete: state.source_resolution_missing.length === 0 && ledger.staging_layer.unresolved_source_ids.length === 0,
  canonical_preserved: state.production_canonical_count === 550 && ledger.canonical_layer.mutable_in_this_package === false,
  staging_unpublished: state.staging_published === 0 && ledger.staging_layer.published === 0,
  mobile_immutable: String(state.mobile_vc11_state).startsWith('IMMUTABLE_REFERENCE_ONLY'),
  no_sensitive_or_cache_entries: !files.some((file) => sensitive.test(file)),
  no_nested_archives: !files.some((file) => file.toLowerCase().endsWith('.zip')),
  continuation_has_exact_next_source: continuation.includes(state.exact_next_sequential_source),
  textual_variant_status_preserved: state.textual_variants.investigated === 3 && state.textual_variants.unresolved === 1
};
const result = {
  validation_id: 'ramaverse-master-continuation-validation-vnext',
  validated_at: new Date().toISOString(),
  package_root_type: packageRoot.includes('/tmp') ? 'WORKING_OR_EXTRACTED_PACKAGE' : 'OTHER',
  checks,
  entries: files.length,
  counts: { canonical: state.production_canonical_count, physical_staging: state.physical_staging_count, ledger: state.ledger_count, sources: state.source_count, tamil_human_reviewed: state.tamil_review_states.human_reviewed, unresolved_variants: state.textual_variants.unresolved },
  valid: Object.values(checks).every(Boolean)
};
fs.writeFileSync(path.join(packageRoot, '15_VALIDATION', 'MASTER_PACKAGE_VALIDATION.json'), `${JSON.stringify(result, null, 2)}\n`, 'utf8');
if (!result.valid) process.exitCode = 1;
console.log(JSON.stringify(result));
