import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = '/home/ubuntu/ramaverse';
const output = '/tmp/ramaverse-master-continuation-2026-08-vnext';
const stamp = '2026-08-20T13:30:00.000Z';
const read = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const sha = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const ensure = (dir) => fs.mkdirSync(dir, { recursive: true });
const copy = (source, dest) => { ensure(path.dirname(dest)); fs.copyFileSync(source, dest); };
const write = (rel, value) => fs.writeFileSync(path.join(output, rel), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
const hashFile = (rel) => sha(path.join(root, rel));

const dirs = [
  '01_CORPUS_AUTHORITY', '02_SEQUENTIAL_STAGING', '03_CHARACTERS', '04_DIALOGUES_DHARMA',
  '05_PLACES_JOURNEYS', '06_DEVOTION', '07_TEMPLES_TRADITIONS', '08_TAMIL_EDITORIAL',
  '09_TEXTUAL_VARIANTS', '10_LANGUAGES', '11_KNOWLEDGE_UNIVERSE_BLUEPRINT', '12_MOBILE_POST_VC11',
  '13_MOBILE_QA', '14_CORPUS_SYNC', '15_VALIDATION', '16_CONTINUATION', '17_CHECKSUMS'
];

const state = read('RAMAVERSE_PROJECT_STATE.json');
const stagingLedger = read('RAMAVERSE_STAGING_MASTER_LEDGER_V11.json');
const sourceLedger = read('SOURCE_LEDGER_V11.json');
const tamilV11 = read('TAMIL_EDITORIAL_REVIEW_QUEUE_V11.json');
const tamilOverlay = read('TAMIL_EDITORIAL_OVERLAY_vNEXT.json');
const coverageBlueprint = read('RAMAVERSE_COVERAGE_MATRIX.json');
const variantLedger = read('TEXTUAL_VARIANCE_LEDGER_vNEXT.json');

const physicalFiles = state.staging_files.filter((rel) => fs.existsSync(path.join(root, rel)));
const physicalRecords = physicalFiles.flatMap((rel) => {
  const value = read(rel);
  return Array.isArray(value) ? value : (value.records ?? value.staging_records ?? []);
});
const idOf = (record) => record.candidate_id ?? record.record_id ?? record.id ?? null;
const ids = physicalRecords.map(idOf).filter(Boolean);
const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
const recordTypes = Object.fromEntries(Object.entries(physicalRecords.reduce((acc, record) => {
  const key = record.record_type ?? 'UNSPECIFIED';
  acc[key] = (acc[key] ?? 0) + 1;
  return acc;
}, {})).sort(([a], [b]) => a.localeCompare(b)));
const sargaNumbers = [...new Set(physicalRecords.map((r) => Number(r.sarga ?? r.sarga_number)).filter(Number.isFinite))].sort((a, b) => a - b);
const kandaCoverage = [...new Set(physicalRecords.map((r) => r.kanda ?? r.kanda_name).filter(Boolean))].sort();
const sourceIdsInRecords = new Set(physicalRecords.flatMap((r) => [r.source_id, ...(r.source_ids ?? [])]).filter(Boolean));
const sourceIdsInLedger = new Set(sourceLedger.sources.map((source) => source.source_id));
const unresolvedSourceIds = [...sourceIdsInRecords].filter((id) => !sourceIdsInLedger.has(id));
const aliases = Object.entries(read('RAMAVERSE-CANONICAL-MOBILE-PACK-v1.4.0.json').alias_index ?? {});
const relationshipEdges = read('RAMAVERSE-CANONICAL-MOBILE-PACK-v1.4.0.json').canonical_relationship_edges ?? [];

const recordCountFromJson = (file) => {
  if (path.extname(file) !== '.json') return null;
  try {
    const value = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (Array.isArray(value)) return value.length;
    for (const key of ['records', 'sources', 'domains', 'items', 'entries', 'variants']) if (Array.isArray(value[key])) return value[key].length;
  } catch { /* inventory keeps parse status below */ }
  return null;
};

const rootNames = fs.readdirSync(root).filter((name) => fs.statSync(path.join(root, name)).isFile());
const outputPattern = /^(RAMAVERSE|SOURCE|TEXTUAL|VERSE|HUMAN|TAMIL|V1_5|PRE_|POST_|EXACT_|VALIDATION|FINAL_|CANONICAL|CONTENT_|PRODUCTION_|TRANSLATION|TRADITION|RAMA_|SITA_|RELATIONAL|IMPLEMENTATION_|ACCESSIBILITY|COMPLETE_|HANDOFF|PENDING|RECOVERY|SOURCE_FREEZE|SHA256|todo)/;
const rootArtifacts = rootNames.filter((name) => outputPattern.test(name) && /\.(json|md|txt|log)$/i.test(name));
const recursive = (dir) => fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const full = path.join(dir, entry.name);
  return entry.isDirectory() ? recursive(full) : [full];
}) : [];
const stagingArtifacts = recursive(path.join(root, 'data/staging')).filter((file) => file.endsWith('.json'));
const scriptArtifacts = recursive(path.join(root, 'scripts')).filter((file) => file.endsWith('.mjs'));
const contractArtifacts = ['server/sourceGovernedCanonical.ts', 'server/sourceGovernedCanonical.test.ts', 'server/stagingMasterLedger.test.ts', 'server/canonicalSurfaceAudit.test.ts', 'client/src/App.tsx', 'client/src/const.ts', 'package.json'].filter((rel) => fs.existsSync(path.join(root, rel))).map((rel) => path.join(root, rel));
const historicArchives = fs.readdirSync('/home/ubuntu').filter((name) => /^RAMAVERSE.*\.zip$/i.test(name) && name !== 'RAMAVERSE-MASTER-CONTINUATION-2026-08-vNEXT.zip').map((name) => path.join('/home/ubuntu', name));

const categoryFor = (basename, rel = '') => {
  const upper = `${rel}/${basename}`.toUpperCase();
  if (upper.includes('/DATA/STAGING/') || upper.includes('STAGING_MASTER') || upper.includes('PRE_RUN') || upper.includes('POST_RUN')) return '02_SEQUENTIAL_STAGING';
  if (upper.includes('SITA_') || upper.includes('HANUMAN') || upper.includes('RAMA_LAKSHMANA') || upper.includes('CHARACTER')) return '03_CHARACTERS';
  if (upper.includes('DIALOGUE') || upper.includes('DHARMA') || upper.includes('GUIDANCE')) return '04_DIALOGUES_DHARMA';
  if (upper.includes('PLACE') || upper.includes('JOURNEY')) return '05_PLACES_JOURNEYS';
  if (upper.includes('DEVOTION') || upper.includes('RAMA_NAMA')) return '06_DEVOTION';
  if (upper.includes('TEMPLE') || upper.includes('FESTIVAL') || upper.includes('TRADITION')) return '07_TEMPLES_TRADITIONS';
  if (upper.includes('TAMIL')) return '08_TAMIL_EDITORIAL';
  if (upper.includes('TEXTUAL') || upper.includes('VERSE_NUMBER') || upper.includes('SOURCE_AUTHORITY') || upper.includes('HUMAN_EDITOR')) return '09_TEXTUAL_VARIANTS';
  if (upper.includes('TRANSLATION') || upper.includes('LANGUAGE')) return '10_LANGUAGES';
  if (upper.includes('COMPLETE_UNIVERSE') || upper.includes('COVERAGE_MATRIX') || upper.includes('DATASET_TARGETS') || upper.includes('MISSING_DATA')) return '11_KNOWLEDGE_UNIVERSE_BLUEPRINT';
  if (upper.includes('MOBILE') && upper.includes('QA')) return '13_MOBILE_QA';
  if (upper.includes('MOBILE')) return '12_MOBILE_POST_VC11';
  if (upper.includes('EXACT_') || upper.includes('NEXT_ACQUISITION') || upper.includes('CONTINUATION')) return '16_CONTINUATION';
  if (upper.includes('VALIDATION') || upper.includes('AUDIT') || upper.includes('INTEGRITY') || upper.includes('REPORT') || upper.includes('CONTRAST')) return '15_VALIDATION';
  if (upper.includes('SYNC') || upper.includes('LEDGER') || upper.includes('RECONCILIATION') || upper.includes('PROJECT_STATE') || upper.includes('SOURCEGOVERNED')) return '14_CORPUS_SYNC';
  return '01_CORPUS_AUTHORITY';
};

const originFor = (name) => {
  if (/S44|S45|S46|S47|S48|V11|SEQUENTIAL/i.test(name)) return 'Queue 1 — sequential acquisition';
  if (/TAMIL/i.test(name)) return 'Queue 2 — Tamil editorial factory';
  if (/TEXTUAL|VERSE_NUMBER|SOURCE_AUTHORITY|HUMAN_EDITOR|BIBLIOGRAPHY/i.test(name)) return 'Queue 3 — source authority';
  if (/COMPLETE_UNIVERSE|COVERAGE_MATRIX|DATASET_TARGETS|MISSING_DATA/i.test(name)) return 'Queue 4 — completeness blueprint';
  return 'Historical post-V1 corpus authority / project baseline';
};
const classificationFor = (name) => {
  if (/STAGING|S\d+_SOURCE_BACKED|PRE_RUN|POST_RUN|V1_5/i.test(name)) return 'staging';
  if (/TAMIL|TEXTUAL|VERSE_NUMBER|SOURCE_AUTHORITY|COMPLETE_UNIVERSE|COVERAGE_MATRIX|MISSING_DATA|DATASET_TARGETS/i.test(name)) return 'research';
  if (/IMPLEMENTATION|ROUTE_MATRIX|ACCESSIBILITY|WEBSITE/i.test(name)) return 'design';
  return 'canonical_or_governance';
};

const inventory = [];
const include = (file, rel, classification = classificationFor(path.basename(file)), status = 'INCLUDED_IN_MASTER') => {
  const base = path.basename(file);
  inventory.push({ filename: rel.replaceAll('\\', '/'), origin_task: originFor(base), size_bytes: fs.statSync(file).size, sha256: sha(file), dataset: categoryFor(base, rel), record_count: recordCountFromJson(file), status, classification });
};
for (const name of rootArtifacts) include(path.join(root, name), name);
for (const file of stagingArtifacts) include(file, path.relative(root, file), 'staging');
for (const file of scriptArtifacts) include(file, path.relative(root, file), 'research');
for (const file of contractArtifacts) include(file, path.relative(root, file), 'design');
for (const file of historicArchives) include(file, `ARCHIVE_HISTORY/${path.basename(file)}`, 'archive_history', 'INVENTORIED_NOT_EMBEDDED_DUPLICATE_ARCHIVE');
inventory.sort((a, b) => a.filename.localeCompare(b.filename));

const directPostV10 = physicalRecords.filter((r) => Number(r.sarga) >= 44);
const directPostV10Status = directPostV10.reduce((acc, r) => { const status = r.tamil_review_status ?? 'MACHINE_DRAFT_NEEDS_REVIEW'; acc[status] = (acc[status] ?? 0) + 1; return acc; }, {});
const overlayReady = tamilOverlay.records?.filter((r) => r.new_status === 'EDITORIAL_DRAFT_READY_FOR_HUMAN_REVIEW').length ?? 0;
const tamilSummary = {
  v10_overlay_scope_records: 320,
  v10_machine_to_editorial_ready: overlayReady,
  post_v10_records: directPostV10.length,
  post_v10_direct_statuses: directPostV10Status,
  current_v11_queue_records: tamilV11.records.length,
  human_reviewed: tamilV11.records.filter((r) => r.human_reviewed === true).length,
  governance_note: 'V10 Tamil overlay is separate from source records; Sargas 44–48 remain governed by their record-level editorial status.'
};
const countType = (type) => recordTypes[type] ?? 0;
const masterState = {
  master_state_id: 'ramaverse-master-continuation-2026-08-vnext',
  generated_at: stamp,
  scope: 'MASTER_INTEGRATION_ONLY',
  production_canonical_count: state.historical_canonical_total,
  physical_staging_count: physicalRecords.length,
  ledger_count: stagingLedger.physicallyAvailableUniqueRecords,
  unique_ids: new Set(ids).size,
  duplicates: duplicateIds.length,
  source_count: sourceLedger.sources.length,
  source_resolution_missing: unresolvedSourceIds,
  sarga_coverage: { kanda: 'Ayodhya Kanda', sargas: sargaNumbers, count: sargaNumbers.length, range: `${sargaNumbers[0]}–${sargaNumbers.at(-1)}` },
  kanda_coverage: kandaCoverage,
  record_type_counts: recordTypes,
  characters: countType('CHARACTER') + countType('CHARACTER_REFERENCE'),
  relationships: countType('RELATIONSHIP'),
  dialogues: countType('DIALOGUE'),
  events: countType('EVENT') + countType('NARRATIVE_SEQUENCE'),
  places: countType('PLACE'),
  journeys: countType('JOURNEY'),
  dharma: countType('DHARMA_LESSON'),
  devotional_records: countType('DEVOTIONAL_CONTEXT'),
  temples: 0,
  languages: { framework_languages: read('TRANSLATION_STATUS.json').languageCount, priority_content_languages: read('TRANSLATION_STATUS.json').contentPriorityLanguages },
  tamil_review_states: tamilSummary,
  textual_variants: { investigated: state.source_authority_research.variants_investigated, unresolved: 1, human_decisions_required: 2, ledger_file: '09_TEXTUAL_VARIANTS/TEXTUAL_VARIANCE_LEDGER_vNEXT.json', variant_ledger_record_count: recordCountFromJson(path.join(root, 'TEXTUAL_VARIANCE_LEDGER_vNEXT.json')) },
  canonical_publication_state: 'FROZEN_CANONICAL_550; no reconciliation performed',
  staging_published: state.staging_published,
  mobile_vc11_state: 'IMMUTABLE_REFERENCE_ONLY; frozen portable canonical pack retained without modification',
  exact_next_sequential_source: state.exact_next_point,
  alias_index: { canonical_alias_keys: aliases.length, canonical_relationship_edges: relationshipEdges.length },
  consistency: { physical_equals_ledger: physicalRecords.length === stagingLedger.physicallyAvailableUniqueRecords, unique_equals_physical: new Set(ids).size === physicalRecords.length, source_resolution_complete: unresolvedSourceIds.length === 0 }
};

const masterLedger = {
  ledger_id: 'ramaverse-master-ledger-2026-08-vnext',
  generated_at: stamp,
  canonical_layer: { count: state.historical_canonical_total, mutable_in_this_package: false, publication_state: 'FROZEN' },
  staging_layer: { physical_count: physicalRecords.length, ledger_count: stagingLedger.physicallyAvailableUniqueRecords, published: state.staging_published, unique_ids: new Set(ids).size, duplicate_ids: duplicateIds, record_type_counts: recordTypes, source_ids_in_records: [...sourceIdsInRecords].sort(), unresolved_source_ids: unresolvedSourceIds },
  source_layer: { master_source_count: sourceLedger.sources.length, source_ledger_file: '01_CORPUS_AUTHORITY/SOURCE_LEDGER_V11.json' },
  mobile_layer: { state: 'IMMUTABLE_REFERENCE_ONLY', pack_id: read('RAMAVERSE-CANONICAL-MOBILE-PACK-v1.4.0.json').manifest.pack_id, staging_published: 0 },
  explicit_non_merge_rule: 'No canonical reconciliation, staging publication, or cross-tradition merge is performed by this package.'
};
const unresolved = {
  generated_at: stamp,
  items: [
    { id: 'canonical-reconciliation', status: 'BLOCKED_BY_EDITORIAL_APPROVAL', detail: '353 staging records remain quarantined; the canonical baseline remains 550.' },
    { id: 'tamil-human-review', status: 'BLOCKED_BY_HUMAN_EDITOR', detail: 'No Tamil record is HUMAN_REVIEWED; the V10 overlay improves 172 machine drafts and retains human review as a required decision.' },
    { id: 'textual-variant-s31', status: 'HUMAN_DECISION_REQUIRED', detail: 'Marked additional-passage variance remains crosswalked but not human approved.' },
    { id: 'textual-variant-s42', status: 'BLOCKED_BY_SOURCE', detail: '34-versus-35 presentation remains unresolved pending scholarly-edition comparison.' },
    { id: 'complete-universe-spine', status: 'PLANNED', detail: 'The 35,950-record blueprint target is architectural only; it does not authorize acquisition or publication.' },
    { id: 'legacy-count-conflict', status: 'RECORDED', detail: 'Legacy count summaries report 451 while protected state reports 550; master package preserves 550 as authoritative.' }
  ]
};
const nextActions = `# RamaVerse Master Next Actions\n\n1. Continue **Queue 1 only** at **${state.exact_next_point}** under staging quarantine.\n2. Obtain human decisions for the Sarga 31 and Sarga 42 textual-variant packets before changing any canonical locator.\n3. Assign Tamil editors to the P1 dialogue pack; do not set \`HUMAN_REVIEWED\` before documented review.\n4. Resolve the 451-versus-550 legacy count conflict through a source-of-truth decision, not a silent merge.\n5. Use the completeness blueprint to approve dataset schemas before any new non-sequential corpus acquisition.\n`;
const continuation = `# RamaVerse Continuation Handoff\n\n## Exact next primary-text source\n\n**${state.exact_next_point}**\n\n## Governance boundary\n\nThe historical canonical baseline is **550**. Physical staging is **${physicalRecords.length}** and must remain unpublished. Public Search and Ask remain canonical-only. The frozen mobile package is reference-only and immutable in this handoff.\n\n## Resume order\n\nResume sequential acquisition only after the next source is accessible and triangulated. Keep new records in staging, retain source/tradition classification, update physical-to-ledger parity once per completed run, and do not reconcile into canonical data without formal editorial approval.\n\n## Human gates\n\nTamil review remains at **0 HUMAN_REVIEWED**. Sarga 31 and Sarga 42 textual variants retain human-decision-required status.\n`;

fs.rmSync(output, { recursive: true, force: true });
for (const dir of dirs) { ensure(path.join(output, dir)); fs.writeFileSync(path.join(output, dir, 'README.md'), `# ${dir}\n\nThis directory is part of the master continuation package. Files are included only where physically available and safe to distribute.\n`, 'utf8'); }
for (const item of inventory.filter((item) => item.status === 'INCLUDED_IN_MASTER')) {
  const source = item.filename.startsWith('data/') || item.filename.startsWith('scripts/') || item.filename.startsWith('server/') || item.filename.startsWith('client/') || item.filename === 'package.json' ? path.join(root, item.filename) : path.join(root, item.filename);
  const dest = path.join(output, item.dataset, 'artifacts', item.filename);
  copy(source, dest);
}
write('RAMAVERSE_MASTER_STATE.json', masterState);
write('RAMAVERSE_MASTER_LEDGER.json', masterLedger);
write('RAMAVERSE_DATASET_INVENTORY.json', { generated_at: stamp, included_artifacts: inventory.filter((item) => item.status === 'INCLUDED_IN_MASTER'), historical_archives_not_embedded: inventory.filter((item) => item.status !== 'INCLUDED_IN_MASTER') });
write('RAMAVERSE_SOURCE_LEDGER_MASTER.json', { generated_at: stamp, source_count: sourceLedger.sources.length, sources: sourceLedger.sources, source_ids_referenced_by_staging: [...sourceIdsInRecords].sort(), unresolved_source_ids: unresolvedSourceIds });
write('RAMAVERSE_COVERAGE_MATRIX_MASTER.json', { generated_at: stamp, current_sarga_coverage: masterState.sarga_coverage, completeness_blueprint: coverageBlueprint.domains.map((domain) => ({ id: domain.id, status: domain.status, recommended_dataset: domain.recommended_dataset, target: domain.estimated_acquisition_size })) });
write('RAMAVERSE_UNRESOLVED_ITEMS.json', unresolved);
fs.writeFileSync(path.join(output, 'RAMAVERSE_NEXT_ACTIONS.md'), nextActions, 'utf8');
fs.writeFileSync(path.join(output, 'CONTINUATION.md'), continuation, 'utf8');
fs.writeFileSync(path.join(output, '17_CHECKSUMS', 'PACKAGE_SCOPE.md'), '# Package Scope\n\nAll entries are inventory-controlled. Historical archive ZIPs are inventoried but not embedded because their unpacked evidence is already present and nested archives would duplicate data.\n', 'utf8');
const sensitive = /(\.env($|\.)|credentials|token|service[-_]?account|google.*\.json|node_modules|(^|\/)dist\/|(^|\/)\.git\/)/i;
const packagedFiles = recursive(output).filter((file) => fs.statSync(file).isFile()).map((file) => path.relative(output, file).replaceAll('\\', '/'));
const sensitiveEntries = packagedFiles.filter((file) => sensitive.test(file));
const buildReport = { generated_at: stamp, output_root: 'PACKAGE_ROOT', directories: dirs, inventory_entries: inventory.length, included_entries: inventory.filter((item) => item.status === 'INCLUDED_IN_MASTER').length, physical_staging_records: physicalRecords.length, ledger_staging_records: stagingLedger.physicallyAvailableUniqueRecords, unique_ids: new Set(ids).size, duplicate_ids: duplicateIds, source_count: sourceLedger.sources.length, unresolved_source_ids: unresolvedSourceIds, sensitive_entries: sensitiveEntries, valid_for_archiving: sensitiveEntries.length === 0 && physicalRecords.length === stagingLedger.physicallyAvailableUniqueRecords && duplicateIds.length === 0 && unresolvedSourceIds.length === 0 };
fs.writeFileSync(path.join(output, '15_VALIDATION', 'MASTER_BUILD_REPORT.json'), `${JSON.stringify(buildReport, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(buildReport));
