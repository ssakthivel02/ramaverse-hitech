import fs from 'node:fs';

const root = '/home/ubuntu/ramaverse/';
const read = (rel) => JSON.parse(fs.readFileSync(root + rel, 'utf8'));
const write = (rel, value) => fs.writeFileSync(root + rel, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
const postV1 = 'data/staging/post_v1/';
const files = fs.readdirSync(root + postV1).filter((file) => /^AYODHYA_S\d+_SOURCE_BACKED_RECORDS\.json$/.test(file)).sort((a, b) => Number(a.match(/S(\d+)/)[1]) - Number(b.match(/S(\d+)/)[1]));
const staging = [...read('data/staging/physical/STAGING_RECORDS.json'), ...files.flatMap((file) => read(postV1 + file).records)];
const ids = staging.map((record) => record.candidate_id);
const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
if (duplicateIds.length) throw new Error(`Duplicate candidate IDs block V12 sync: ${duplicateIds.join(', ')}`);
const required = ['candidate_id', 'record_type', 'kanda', 'sarga', 'verse_locator', 'source_id', 'source_locator', 'source_type', 'tradition_classification', 'english_explanation', 'tamil_draft', 'tamil_review_status', 'confidence', 'merge_state', 'possible_legacy_overlap', 'publication_policy'];
const incomplete = staging.filter((record) => record.candidate_id.startsWith('stg-postv1-') && required.some((field) => record[field] === undefined || record[field] === null || record[field] === ''));
if (incomplete.length) throw new Error(`Incomplete post-V1 records: ${incomplete.map((record) => record.candidate_id).join(', ')}`);

const source = (sarga, range, provider, role, url, caveat) => ({
  source_id: `src-valmiki-ayodhya-s${sarga}-${provider}`,
  title: `Valmiki Ramayana — Ayodhya Kanda — Sarga ${sarga}`,
  repository: provider.startsWith('stotranidhi') ? 'Stotra Nidhi' : provider.startsWith('sanskritdocuments') ? 'SanskritDocuments.org' : provider.startsWith('vedapath') ? 'Vedapath' : 'ReadRamayana',
  source_role: role,
  sourceType: role === 'PRIMARY_ACQUISITION_SOURCE' ? 'PRIMARY_TEXT_DIGITAL_RENDITION' : role === 'TEXTUAL_CROSSCHECK' ? 'PRIMARY_TEXT_DIGITAL_CROSSCHECK' : 'EDITION_REFERENCE',
  kanda: 'Ayodhya Kanda', sarga, verse_range: range, url, accessedAt: '2026-08-20', tradition: 'Valmiki', confidence: role === 'PRIMARY_ACQUISITION_SOURCE' ? 'high' : 'medium',
  caveat
});
const additions = [
  source(48, '2.48.1–2.48.37', 'readramayana-edition-reference', 'ADDITIONAL_EDITION_REFERENCE', 'https://readramayana.org/Ayodhya/48', 'Independent displayed locator set verified during V12 synchronization; edition reference only, not a critical edition.'),
  source(49, '2.49.1–2.49.18', 'stotranidhi', 'PRIMARY_ACQUISITION_SOURCE', 'https://stotranidhi.com/en/ayodhya-kanda-sarga-49-in-english/', 'Accessible chapter presentation; not a critical edition.'),
  source(49, '2.49.8', 'vedapath-v8-crosscheck', 'TEXTUAL_CROSSCHECK', 'https://vedapath.app/en/ramayana/ayodhya-kanda/49/8', 'Independent verse-level display for 2.49.8; not a critical edition.'),
  source(49, '2.49.1–2.49.18', 'readramayana-edition-reference', 'ADDITIONAL_EDITION_REFERENCE', 'https://readramayana.org/Ayodhya/49', 'Independent displayed locator set; edition reference only, not a critical edition.'),
  source(50, '2.50.1–2.50.51', 'stotranidhi', 'PRIMARY_ACQUISITION_SOURCE', 'https://stotranidhi.com/en/ayodhya-kanda-sarga-50-in-english/', 'Accessible chapter presentation with 51 displayed verses; not a critical edition.'),
  source(50, '2.50.19', 'vedapath-v19-crosscheck', 'TEXTUAL_CROSSCHECK', 'https://vedapath.app/en/ramayana/ayodhya-kanda/50/19', 'Independent verse-level display for 2.50.19; not a critical edition.'),
  source(50, '2.50.1–2.50.52', 'readramayana-edition-reference', 'ADDITIONAL_EDITION_REFERENCE', 'https://readramayana.org/Ayodhya/50', 'Independent locator display through 52; retained as a count variance, not a critical edition.'),
  source(51, '2.51.1–2.51.27', 'stotranidhi', 'PRIMARY_ACQUISITION_SOURCE', 'https://stotranidhi.com/en/ayodhya-kanda-sarga-51-in-english/', 'Accessible chapter presentation; not a critical edition.'),
  source(51, '2.51.10', 'vedapath-v10-crosscheck', 'TEXTUAL_CROSSCHECK', 'https://vedapath.app/en/ramayana/ayodhya-kanda/51/10', 'Independent verse-level display for 2.51.10; not a critical edition.'),
  source(51, '2.51.1–2.51.27', 'readramayana-edition-reference', 'ADDITIONAL_EDITION_REFERENCE', 'https://readramayana.org/Ayodhya/51', 'Independent displayed locator set; edition reference only, not a critical edition.'),
  source(52, '2.52.1–2.52.102', 'stotranidhi', 'PRIMARY_ACQUISITION_SOURCE', 'https://stotranidhi.com/en/ayodhya-kanda-sarga-52-in-english/', 'Accessible chapter presentation; not a critical edition.'),
  source(52, '2.52.1–2.52.102', 'sanskritdocuments-crosscheck', 'TEXTUAL_CROSSCHECK', 'https://sanskritdocuments.org/sites/valmikiramayan/ayodhya/sarga52/ayodhyaitrans52.htm', 'Independent chapter rendering and introduction; not a critical edition.'),
  source(52, '2.52.1–2.52.102', 'readramayana-edition-reference', 'ADDITIONAL_EDITION_REFERENCE', 'https://readramayana.org/Ayodhya/52', 'Independent displayed locator set; edition reference only, not a critical edition.')
];
const sourceLedger = read('SOURCE_LEDGER_V11.json');
const sourceIds = new Set(sourceLedger.sources.map((item) => item.source_id));
sourceLedger.sources.push(...additions.filter((item) => !sourceIds.has(item.source_id)));
sourceLedger.ledgerId = 'ramaverse-master-source-ledger-v12';
sourceLedger.generatedAt = '2026-08-20T13:45:00.000Z';
write('SOURCE_LEDGER_V12.json', sourceLedger);

const referencedSourceIds = new Set(staging.flatMap((record) => [record.source_id, ...(record.crosscheck_source_ids ?? [])]).filter((id) => id && !id.startsWith('NOT_AVAILABLE')));
const unknownSources = [...referencedSourceIds].filter((id) => !sourceLedger.sources.some((item) => item.source_id === id));
if (unknownSources.length) throw new Error(`Missing source-ledger entries: ${unknownSources.join(', ')}`);
const queue = staging.map((record) => ({ record_id: record.candidate_id, record_type: record.record_type, translation_status: record.tamil_review_status === 'EDITORIAL_DRAFT_READY_FOR_HUMAN_REVIEW' ? 'EDITORIAL_DRAFT_READY_FOR_HUMAN_REVIEW' : 'MACHINE_DRAFT_NEEDS_REVIEW', human_reviewed: false, priority: record.record_type === 'DIALOGUE' ? 'P1' : 'P2' }));
const states = queue.reduce((all, item) => ({ ...all, [item.translation_status]: (all[item.translation_status] ?? 0) + 1 }), {});
const recordTypes = staging.reduce((all, record) => ({ ...all, [record.record_type]: (all[record.record_type] ?? 0) + 1 }), {});
const sargas = [...new Set(staging.map((record) => record.sarga).filter(Number.isFinite))].sort((a, b) => a - b);
const ledger = { historicalCanonicalBaseline: 550, physicallyAvailableUniqueRecords: staging.length, stagingPublished: 0, duplicates: { candidateIds: [], count: 0 }, publicSurfacePolicy: { search: 'CANONICAL_ONLY', ask: 'CANONICAL_ONLY', stagingExposure: 0 }, sourceLedger: 'SOURCE_LEDGER_V12.json', sargaCoverage: { kanda: 'Ayodhya Kanda', sargas, range: `${sargas[0]}–${sargas.at(-1)}` }, recordTypeCounts: recordTypes };
write('RAMAVERSE_STAGING_MASTER_LEDGER_V12.json', ledger);
write('TAMIL_EDITORIAL_REVIEW_QUEUE_V12.json', { records: queue, countsByTranslationState: states, humanReviewedCount: 0, editorialDraftsImprovedThisRun: staging.filter((record) => record.sarga >= 49 && record.tamil_review_status === 'EDITORIAL_DRAFT_READY_FOR_HUMAN_REVIEW').length });
write('EXACT_PHYSICAL_CONTINUATION_V12.json', { last_fully_acquired_kanda: 'Ayodhya Kanda', last_fully_acquired_sarga: 52, last_fully_acquired_verse: '2.52.102', next_unacquired_verse: '2.53.1' });
write('V1_5_RECONCILIATION_PREVIEW_V12.json', { status: 'EDITORIAL_PREVIEW_ONLY_NOT_PRODUCTION_READY', historicalCanonicalBaseline: 550, physicalStagingRecords: staging.length, stagingPublished: 0, tamilReview: queue.length, nextUnacquiredVerse: '2.53.1' });
const crosswalk = read('VERSE_NUMBERING_CROSSWALK_vNEXT.json');
crosswalk.generated_at = '2026-08-20T13:45:00.000Z';
crosswalk.cases.push({ case_id: 'ayodhya-s50-sn-rr', kanda: 'Ayodhya Kanda', sarga: 50, classification: 'DISPLAY_COUNT_VARIANCE_UNRESOLVED', source_a: { source_key: 'SN', displayed_range: '2.50.1–2.50.51' }, source_b: { source_key: 'RR', displayed_range: '2.50.1–2.50.52' }, supported_mappings: [{ source_a: '2.50.1–2.50.51', source_b: '2.50.1–2.50.51', relation: 'IDENTICAL_DISPLAYED_NUMBERING_CONFIRMED' }, { source_a: null, source_b: '2.50.52', relation: 'NO_INFERRED_MAPPING; CONSULT_SCHOLARLY_EDITION' }], unsupported_claims: ['That source B verse 52 is a verse split, additional recension reading, or source error.', 'That either digital presentation reproduces a scholarly critical text.'], confidence: 'HIGH for display-count difference; LOW for cause.' });
write('VERSE_NUMBERING_CROSSWALK_V12.json', crosswalk);
write('TEXTUAL_VARIANCE_ADJUDICATION_QUEUE_V12.json', { status: 'HUMAN_DECISION_REQUIRED', inherited_cases: ['ayodhya-s31-sd-sn', 'ayodhya-s32-sd-sn-rr', 'ayodhya-s42-sd-sn-rr'], new_case: { case_id: 'ayodhya-s50-sn-rr', issue: 'Stotra Nidhi displays through 2.50.51; ReadRamayana displays through 2.50.52.', recommended_handling: 'Do not alter the Sarga 50 staging locator or infer a verse split/join. Keep a display-count variance and consult an apparatus-bearing edition before resolution.', exact_human_decision_required: 'Classify the apparent ReadRamayana 2.50.52 as display-only, verse split/join, content variance, source error, or unresolved after reviewing a scholarly edition.', confidence: 'HIGH for difference; LOW for cause.' }, human_approved: false });
const post = { physicalStaging: staging.length, ledgerStaging: staging.length, physicalLedgerMatch: true, uniqueIds: ids.length, duplicateIds: [], missingRequiredFields: [], missingSourceIds: [], sourceCount: sourceLedger.sources.length, tamilReviewQueue: queue.length, tamilReviewStates: states, humanReviewedCount: 0, lastFullyAcquired: '2.52.102', nextUnacquiredVerse: '2.53.1', stagingPublished: 0, publicSearchStaging: 0, publicAskStaging: 0, valid: true };
write('POST_RUN_AUTHORITY_STATE_V12.json', post);
write('VALIDATION_SEQUENTIAL_V12.json', { generatedAt: '2026-08-20T13:45:00.000Z', historicalCanonicalBaseline: 550, physicalStaging: staging.length, ledgerStaging: staging.length, physicalLedgerMatch: true, uniqueIds: ids.length, duplicateIds: [], missingRequiredFields: [], missingSourceIds: [], sourceCount: sourceLedger.sources.length, stagingPublished: 0, nonQuarantineRecords: staging.filter((record) => record.publication_policy !== 'STAGING_QUARANTINE_ONLY').map((record) => record.candidate_id), publicSearchStaging: 0, nextExactSource: 'Ayodhya Kanda / Sarga 53 / 2.53.1', valid: true });
const project = read('RAMAVERSE_PROJECT_STATE.json');
project.historical_canonical_total = 550;
project.RV_01_staging_count = staging.length;
project.staging_published = 0;
project.staging_files = ['data/staging/physical/STAGING_RECORDS.json', ...files.map((file) => postV1 + file)];
project.RV_01_continuation = { kanda: 'Ayodhya Kanda', sarga: 53, verse: '2.53.1' };
project.exact_next_point = 'Ayodhya Kanda Sarga 53, verse 2.53.1';
project.latest_batch_ids = [49, 50, 51, 52].map((sarga) => `post-v1-ayodhya-s${sarga}-source-backed-v1`);
project.task_output_map = { ...(project.task_output_map ?? {}), physical_ledger: 'RAMAVERSE_STAGING_MASTER_LEDGER_V12.json', continuation: 'EXACT_PHYSICAL_CONTINUATION_V12.json', source_ledger: 'SOURCE_LEDGER_V12.json', tamil_queue: 'TAMIL_EDITORIAL_REVIEW_QUEUE_V12.json', variance_crosswalk: 'VERSE_NUMBERING_CROSSWALK_V12.json', variance_adjudication_queue: 'TEXTUAL_VARIANCE_ADJUDICATION_QUEUE_V12.json', corpus_validation: 'VALIDATION_SEQUENTIAL_V12.json' };
project.updated_at = '2026-08-20T13:45:00.000Z';
write('RAMAVERSE_PROJECT_STATE.json', project);
console.log(JSON.stringify({ physical: staging.length, sources: sourceLedger.sources.length, tamilQueue: queue.length, editorialReadyNew: staging.filter((record) => record.sarga >= 49 && record.tamil_review_status === 'EDITORIAL_DRAFT_READY_FOR_HUMAN_REVIEW').length, next: '2.53.1' }));
