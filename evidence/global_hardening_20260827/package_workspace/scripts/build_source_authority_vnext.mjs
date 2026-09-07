import fs from 'node:fs';
import path from 'node:path';

const root = '/home/ubuntu/ramaverse';
const now = '2026-08-20T12:30:00.000Z';
const read = (name) => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const write = (name, value) => fs.writeFileSync(path.join(root, name), `${JSON.stringify(value, null, 2)}\n`, 'utf8');

const bibliography = {
  generated_at: now,
  research_scope: 'Ayodhya Kanda Sargas 31, 32, and 42 only. Bibliographic evidence is not a textual collation or editorial approval.',
  sources: [
    {
      source_key: 'SD',
      title: 'Valmiki Ramayana – Ayodhya Kanda Sargas 31, 32, 42',
      publisher_or_repository: 'Sanskrit Documents',
      source_class: 'DIGITAL_PRESENTATION_WITH_WORD_FOR_WORD_ENGLISH',
      editor_translator: 'K. M. K. Murthy credited on the Sarga 42 page; full edition statement not supplied on the inspected pages',
      publication_information: 'Pages state “Verses converted to UTF-8, Nov 09”; Sarga 42 page bears © July 2002 K. M. K. Murthy.',
      recension_or_edition: 'Not stated on the inspected pages.',
      institutional_status: 'Independent digital presentation; not designated here as a critical edition.',
      urls: [
        'https://sanskritdocuments.org/sites/valmikiramayan/ayodhya/sarga31/ayodhyaroman31.htm',
        'https://sanskritdocuments.org/sites/valmikiramayan/ayodhya/sarga32/ayodhyaroman32.htm',
        'https://sanskritdocuments.org/sites/valmikiramayan/ayodhya/sarga42/ayodhyaitrans42.htm'
      ]
    },
    {
      source_key: 'SN',
      title: 'Stotra Nidhi – Valmiki Ramayana Ayodhya Kanda Sargas 31, 32, 42',
      publisher_or_repository: 'Stotra Nidhi',
      source_class: 'DIGITAL_DEVOTIONAL_PRESENTATION',
      editor_translator: 'No named editor or textual edition statement supplied on the inspected pages.',
      publication_information: 'Inspected pages say Updated on July 24, 2024 and offer multiple script renditions.',
      recension_or_edition: 'Not stated on the inspected pages.',
      institutional_status: 'Digital devotional presentation; not designated here as a critical edition.',
      urls: [
        'https://stotranidhi.com/en/ayodhya-kanda-sarga-31-in-english/',
        'https://stotranidhi.com/en/ayodhya-kanda-sarga-32-in-english/',
        'https://stotranidhi.com/en/ayodhya-kanda-sarga-42-in-english/'
      ]
    },
    {
      source_key: 'GRETIL',
      title: 'Vālmīki: Rāmāyaṇa-rev-2-3',
      publisher_or_repository: 'Göttingen Register of Electronic Texts in Indian Languages (SUB Göttingen)',
      source_class: 'INSTITUTIONAL_MACHINE_READABLE_REFERENCE_TEXT',
      editor_translator: 'Original input Muneo Tokunaga; revision Oliver Hellwig.',
      publication_information: 'TEI conversion dated 2020-07-31. Header records occasional minor corrections according to the Southern recension.',
      recension_or_edition: 'Heterogeneous legacy corpus source; the header explicitly warns that markup may be suboptimal.',
      institutional_status: 'Institutional repository reference text; not a substitute for a critical-edition apparatus.',
      urls: ['https://gretil.sub.uni-goettingen.de/gretil/corpustei/transformations/html/sa_vAlmIki-rAmAyaNa-rev-2-3.htm']
    },
    {
      source_key: 'RR',
      title: 'ReadRamayana – Ayodhya Kaanda Sargas 32 and 42',
      publisher_or_repository: 'ReadRamayana.org',
      source_class: 'DIGITAL_TEXT_VIEWER',
      editor_translator: 'Not identified on the inspected page.',
      publication_information: 'The viewer exposes quarter-verse labels and script-selection controls.',
      recension_or_edition: 'Not stated on the inspected page.',
      institutional_status: 'Independent web reference; it corroborates displayed counts but does not supply an editorial apparatus.',
      urls: ['https://readramayana.org/Ayodhya/32', 'https://readramayana.org/Ayodhya/42']
    },
    {
      source_key: 'VAIDYA1962',
      title: 'The Vālmīki Rāmāyaṇa: Critical Edition, vol. II (Ayodhyākāṇḍa)',
      publisher_or_repository: 'Oriental Institute, Baroda; bibliographic/item record at Internet Archive',
      source_class: 'CRITICAL_SCHOLARLY_EDITION',
      editor_translator: 'P. L. Vaidya, editor.',
      publication_information: '1962.',
      recension_or_edition: 'Critical Edition, Ayodhyākāṇḍa volume.',
      institutional_status: 'Appropriate priority reference for a future apparatus-level consultation; no unverified page-level claim is drawn from it in this package.',
      urls: ['https://archive.org/details/RmyaaCriticalEdition2EDPLVaidya1962']
    },
    {
      source_key: 'LABHAYA1928',
      title: 'The Ramayana of Valmiki, Ayodhya kanda (North-western recension)',
      publisher_or_repository: 'D.A.V. College, Lahore; catalogued by HathiTrust',
      source_class: 'RECENSION_SPECIFIC_SCHOLARLY_EDITION',
      editor_translator: 'Ram Labhaya, editor.',
      publication_information: 'Lahore, 1928; catalog record notes five parts published 1923–28.',
      recension_or_edition: 'North-western recension, critically edited from original manuscripts according to catalog record.',
      institutional_status: 'Recension-specific authority; useful for comparison, not an automatic universal baseline.',
      urls: ['https://catalog.hathitrust.org/Record/102658765']
    }
  ]
};

const authorityMatrix = {
  generated_at: now,
  rule: 'Rank by editorial method, provenance, and relevance to the textual question; never by search-result order.',
  hierarchy: [
    { tier: 1, category: 'CRITICAL_OR_SCHOLARLY_EDITIONS', use: 'Primary adjudication reference when an apparatus, editor, recension statement, and page-level locus are available.', restrictions: 'Do not infer a reading until the relevant edition page and apparatus are checked.' },
    { tier: 2, category: 'TRADITIONAL_SANSKRIT_EDITION_WITH_IDENTIFIED_EDITOR', use: 'Compare a defined traditional text and its stated recension.', restrictions: 'Distinguish its recension from a critical reconstruction.' },
    { tier: 3, category: 'INSTITUTIONAL_REPOSITORIES_AND_STANDARDIZED_E_TEXTS', use: 'Locate readings and test displayed numbering; retain source-version metadata.', restrictions: 'Treat conversion or transcription artefacts as possible display risks.' },
    { tier: 4, category: 'ESTABLISHED_TRANSLATIONS', use: 'Check translation segmentation and identify where a translator or web presentation groups verses.', restrictions: 'Never use translation wording alone to reconstruct Sanskrit segmentation.' },
    { tier: 5, category: 'DIGITAL_DEVOTIONAL_PRESENTATIONS', use: 'Record accessible display evidence and explicitly marked additional passages.', restrictions: 'No critical-edition status is implied; editorial policy must be stated before use in adjudication.' },
    { tier: 6, category: 'REGIONAL_RETELLINGS_AND_LATER_TEXTS', use: 'Treat as separately classified traditions for reception history.', restrictions: 'Never merge into primary Valmiki-text records without a clearly labelled cross-tradition claim.' },
    { tier: 7, category: 'ORAL_AND_FOLK_TRADITIONS', use: 'Record provenance, performer/community context, and transmission setting.', restrictions: 'Never silently substitute for a source-text reading.' }
  ],
  assessed_sources: bibliography.sources.map((source) => ({ source_key: source.source_key, source_class: source.source_class, authority_tier: source.source_key === 'VAIDYA1962' ? 1 : source.source_key === 'LABHAYA1928' ? 2 : source.source_key === 'GRETIL' ? 3 : source.source_key === 'RR' ? 4 : 5, permitted_role: source.source_key === 'VAIDYA1962' || source.source_key === 'LABHAYA1928' ? 'SCHOLARLY_ADJUDICATION_REFERENCE_PENDING_PAGE_LEVEL_CHECK' : 'DISPLAY_OR_REFERENCE_EVIDENCE_ONLY' }))
};

const crosswalk = {
  generated_at: now,
  editorial_status: 'HUMAN_DECISION_REQUIRED',
  method: 'Mappings are recorded only where direct displayed numbering supports them. Gaps are explicit and are not filled merely to equalize counts.',
  cases: [
    {
      case_id: 'ayodhya-s31-sd-sn', kanda: 'Ayodhya Kanda', sarga: 31,
      classification: 'NUMBERING_OFFSET_WITH_MARKED_ADDITIONAL_PASSAGE',
      source_a: { source_key: 'SD', displayed_range: '2.31.1–2.31.35' },
      source_b: { source_key: 'SN', displayed_range: '2.31.1–2.31.37', marked_additional_passage: '2.31.20–2.31.21, labelled adhikapāṭhaḥ' },
      supported_mappings: [
        { source_a: '2.31.1–2.31.19', source_b: '2.31.1–2.31.19', relation: 'IDENTICAL_DISPLAY_NUMBERING' },
        { source_a: null, source_b: '2.31.20–2.31.21', relation: 'MARKED_ADDITIONAL_PASSAGE_IN_SOURCE_B' },
        { source_a: '2.31.20–2.31.35', source_b: '2.31.22–2.31.37', relation: 'POST_INSERTION_NUMBERING_OFFSET' }
      ],
      unsupported_claims: ['Whether the additional passage belongs to a particular manuscript family, recension, or editorial tradition.', 'Whether either presentation reproduces a scholarly critical text.'],
      confidence: 'HIGH for display mapping; LOW for textual-historical explanation.'
    },
    {
      case_id: 'ayodhya-s32-sd-sn-rr', kanda: 'Ayodhya Kanda', sarga: 32,
      classification: 'DISPLAY_ONLY_VARIANCE',
      source_a: { source_key: 'SD', observed_presentation: 'Some consecutive verses are grouped in a single word-for-word display block, including 5–6, 15–16, and 18–20.' },
      source_b: { source_key: 'SN', displayed_range: '2.32.1–2.32.45' },
      source_c: { source_key: 'RR', displayed_range: '2.32.1–2.32.45 with quarter-verse labels' },
      supported_mappings: [{ source_a: '2.32.1–2.32.45', source_b: '2.32.1–2.32.45', source_c: '2.32.1–2.32.45', relation: 'SAME_DISPLAYED_NUMBER_SET; PRESENTATION_GROUPING_DIFFERS' }],
      unsupported_claims: ['A manuscript or recension difference.', 'A semantic content difference.'],
      confidence: 'HIGH for display-only handling.'
    },
    {
      case_id: 'ayodhya-s42-sd-sn-rr', kanda: 'Ayodhya Kanda', sarga: 42,
      classification: 'SOURCE_ERROR_OR_DISPLAY_VARIANCE_OR_UNKNOWN',
      source_a: { source_key: 'SD', displayed_range: '2.42.1–2.42.34' },
      source_b: { source_key: 'SN', displayed_range: '2.42.1–2.42.35' },
      source_c: { source_key: 'RR', displayed_range: '2.42.1–2.42.35 with quarter-verse labels' },
      supported_mappings: [{ source_a: '2.42.1–2.42.14', source_b: '2.42.1–2.42.14', source_c: '2.42.1–2.42.14', relation: 'IDENTICAL_DISPLAY_NUMBERING_CONFIRMED' }, { source_a: '2.42.15–2.42.34', source_b: null, source_c: null, relation: 'NO_INFERRED_ONE_TO_ONE_MAPPING; CONSULT_SCHOLARLY_EDITION' }],
      observed_warning: 'The inspected Sanskrit Documents display around verses 15–17 contains inconsistent grouping and duplicated/shifted explanatory treatment, so its 34-verse count cannot safely be classified as a simple join or split from browser evidence alone.',
      unsupported_claims: ['That verse 35 is absent from a recension.', 'That any specific pair is a verse split or join.', 'That one website is textually authoritative over the other.'],
      confidence: 'HIGH that the digital displays differ; LOW on cause and textual status.'
    }
  ]
};

const ledger = {
  generated_at: now,
  status: 'NO_CANONICAL_OR_STAGING_MUTATION',
  cases: [
    {
      case_id: 'ayodhya-s31', issue: 'Sanskrit Documents displays 35 verses; Stotra Nidhi displays 37 and explicitly marks verses 20–21 as additional.',
      evidence: ['SD pages visibly list 1–35.', 'SN page labels verses 20–21 adhikapāṭhaḥ and continues 22–37.', 'GRETIL provides recension-aware e-text metadata but was not used to assert an unverified Sarga 31 reading.'],
      classification: 'CONTENT_VARIANCE_WITH_NUMBERING_CONSEQUENCE', semantic_difference: 'Two marked additional lines are present in SN but not displayed in SD.', numbering_difference: 'SN 22–37 align to SD 20–35 after its marked insertion.', recommended_handling: 'Preserve both cited locators; use the crosswalk for retrieval; label the inserted passage as source-specific pending scholarly check.', confidence: 'HIGH for display comparison; LOW for recension attribution.', alternative: 'If the specified scholarly edition prints or excludes the pair, promote the result to a defined edition-specific reading.', impact_if_wrong: 'A forced one-to-one citation could mislocate later Sarga 31 passages.', exact_human_decision_required: 'Choose whether to retain the two SN-marked lines as an explicitly source-specific variant or exclude them from future primary acquisition pending scholarly apparatus review.', human_approved: false
    },
    {
      case_id: 'ayodhya-s32', issue: 'Existing concern over display presentation for Sarga 32.',
      evidence: ['SD groups several consecutive verse explanations in shared display blocks.', 'SN and RR both display 1–45.', 'No added verse marker or contradictory content evidence was found in the inspected material.'],
      classification: 'DISPLAY_ONLY_VARIANCE', semantic_difference: 'None demonstrated.', numbering_difference: 'None demonstrated; all compared displays retain 1–45.', recommended_handling: 'Treat as display-only. Keep original source locators and do not create a semantic variant record.', confidence: 'HIGH.', alternative: 'Reopen only if a source with a stated edition shows a contrary verse set.', impact_if_wrong: 'Low; a display grouping may be mistaken for a verse-count difference.', exact_human_decision_required: 'None required for operational handling; optional confirmation that display-only classification is accepted.', human_approved: false
    },
    {
      case_id: 'ayodhya-s42', issue: 'Sanskrit Documents displays 1–34; Stotra Nidhi and ReadRamayana display 1–35.',
      evidence: ['SD closing locator lists 1–34.', 'SN and RR independently display 1–35.', 'SD material around 15–17 is internally inconsistent in grouping, preventing a safe split/join inference from web evidence.'],
      classification: 'UNKNOWN_PENDING_SCHOLARLY_EDITION_CHECK', semantic_difference: 'Not determined.', numbering_difference: '34 versus 35 displayed verses.', recommended_handling: 'Keep parallel source ranges and avoid one-to-one lookup after verse 14 until a stated scholarly edition or page-level apparatus is checked.', confidence: 'HIGH for display discrepancy; LOW for cause.', alternative: 'Classify as a source-display error only after a controlled comparison with a scholarly edition establishes a shared verse text and segmentation.', impact_if_wrong: 'Incorrect mapping can miscite dialogue, event, and source locators in Sarga 42.', exact_human_decision_required: 'Consult the relevant page(s) of Vaidya 1962 or another stated edition; then choose NUMBERING_CROSSWALK, VERSE_JOIN/SPLIT, RECENSION_VARIANCE, or SOURCE_ERROR.', human_approved: false
    }
  ]
};

const decisionPack = `# Human Editor Decision Pack vNEXT\n\nThis pack records **three digital presentation variants**. It does not alter the 550 canonical baseline, staging records, or the frozen mobile pack. No recommendation is marked human-approved.\n\n## Decision summary\n\n| Sarga | Observed displays | Recommendation | Confidence | Human decision |\n|---|---|---|---|---|\n| 31 | SD 1–35; SN 1–37, with SN 20–21 labelled *adhikapāṭhaḥ* | Crosswalk plus source-specific additional-passage label | High for mapping; low for historical cause | Retain as source-specific or exclude pending apparatus review |\n| 32 | SD shared display blocks; SN/RR 1–45 | Display-only variance | High | Optional acceptance of operational classification |\n| 42 | SD 1–34; SN/RR 1–35 | Unresolved; consult scholarly edition | High for discrepancy; low for cause | Decide after page-level scholarly comparison |\n\n## Case 1 — Ayodhya Kanda Sarga 31\n\n**Issue.** Sanskrit Documents displays 35 verses, while Stotra Nidhi displays 37. Stotra Nidhi explicitly labels its verses 20–21 as *adhikapāṭhaḥ* (additional passage).\n\n| Required field | Evidence-led finding |\n|---|---|\n| Source A | Sanskrit Documents: 2.31.1–35 [1] |\n| Source B | Stotra Nidhi: 2.31.1–37, with 20–21 marked additional [2] |\n| Source C | GRETIL provides institutional e-text metadata but no page-level apparatus conclusion is used here [3] |\n| Semantic difference | The two additional lines are displayed in B and not displayed in A. Their manuscript status is not established. |\n| Numbering difference | A 1–19 ↔ B 1–19; B 20–21 = marked insertion; A 20–35 ↔ B 22–37. |\n| Recommended handling | Apply the crosswalk and keep the additional pair source-specific. |\n| Alternative | A scholarly-edition check can establish an edition-specific inclusion/exclusion rule. |\n| Impact if wrong | Later source citations may be offset by two verses. |\n| Exact human decision | Retain the marked pair as source-specific variant evidence, or suppress it from future primary acquisition until apparatus review. |\n\n## Case 2 — Ayodhya Kanda Sarga 32\n\n**Issue.** The Sanskrit Documents display groups some consecutive verses into one explanatory block, but Stotra Nidhi and ReadRamayana both expose 1–45.\n\n| Required field | Evidence-led finding |\n|---|---|\n| Source A | Sanskrit Documents shared display blocks, including 5–6 and 18–20 [4] |\n| Source B | Stotra Nidhi 1–45 [5] |\n| Source C | ReadRamayana 1–45 with quarter-verse labels [6] |\n| Semantic difference | None demonstrated. |\n| Numbering difference | None demonstrated. |\n| Recommended handling | Display-only variance; retain existing locators. |\n| Alternative | Reopen only if a stated edition yields a different text/verse set. |\n| Impact if wrong | Low; the risk is a misleading visual grouping. |\n| Exact human decision | None operationally required; editor may accept the display-only classification. |\n\n## Case 3 — Ayodhya Kanda Sarga 42\n\n**Issue.** Sanskrit Documents ends at 34, while Stotra Nidhi and ReadRamayana both show 35. The inspected Sanskrit Documents region around 15–17 has inconsistent grouping, so a join/split cannot be safely inferred.\n\n| Required field | Evidence-led finding |\n|---|---|\n| Source A | Sanskrit Documents 1–34 [7] |\n| Source B | Stotra Nidhi 1–35 [8] |\n| Source C | ReadRamayana 1–35 [9] |\n| Semantic difference | Not determined. |\n| Numbering difference | 34 versus 35 displayed verses. |\n| Recommended handling | Keep separate source ranges; do not infer post-14 mappings. |\n| Alternative | Classify as a source error or verse join/split only after page-level comparison with a scholarly edition. |\n| Impact if wrong | A forced mapping could miscite Sarga 42 content. |\n| Exact human decision | Check Vaidya 1962 or another stated scholarly edition at the relevant locus, then select the variance class. |\n\n## Authority rule for future acquisition\n\n> A search hit is never a source-ranking method. Prefer a stated scholarly edition or defined recension for adjudication; use institutional e-texts and digital presentations as labelled comparison witnesses.\n\nThe source hierarchy and bibliography are in the companion JSON files.\n\n## References\n\n[1]: https://sanskritdocuments.org/sites/valmikiramayan/ayodhya/sarga31/ayodhyaroman31.htm\n[2]: https://stotranidhi.com/en/ayodhya-kanda-sarga-31-in-english/\n[3]: https://gretil.sub.uni-goettingen.de/gretil/corpustei/transformations/html/sa_vAlmIki-rAmAyaNa-rev-2-3.htm\n[4]: https://sanskritdocuments.org/sites/valmikiramayan/ayodhya/sarga32/ayodhyaroman32.htm\n[5]: https://stotranidhi.com/en/ayodhya-kanda-sarga-32-in-english/\n[6]: https://readramayana.org/Ayodhya/32\n[7]: https://sanskritdocuments.org/sites/valmikiramayan/ayodhya/sarga42/ayodhyaitrans42.htm\n[8]: https://stotranidhi.com/en/ayodhya-kanda-sarga-42-in-english/\n[9]: https://readramayana.org/Ayodhya/42\n`;

write('SOURCE_BIBLIOGRAPHY.json', bibliography);
write('SOURCE_AUTHORITY_MATRIX.json', authorityMatrix);
write('VERSE_NUMBERING_CROSSWALK_vNEXT.json', crosswalk);
write('TEXTUAL_VARIANCE_LEDGER_vNEXT.json', ledger);
fs.writeFileSync(path.join(root, 'HUMAN_EDITOR_DECISION_PACK_vNEXT.md'), decisionPack, 'utf8');

const state = read('RAMAVERSE_PROJECT_STATE.json');
state.task_output_map = { ...state.task_output_map, source_authority_vnext: 'TEXTUAL_VARIANCE_LEDGER_vNEXT.json', verse_crosswalk_vnext: 'VERSE_NUMBERING_CROSSWALK_vNEXT.json', source_bibliography: 'SOURCE_BIBLIOGRAPHY.json', human_editor_decision_pack_vnext: 'HUMAN_EDITOR_DECISION_PACK_vNEXT.md' };
state.source_authority_research = { scope: 'Sargas 31, 32, 42 only', variants_investigated: 3, canonical_modified: 0, staging_published: 0, mobile_pack_modified: 0, outputs: ['TEXTUAL_VARIANCE_LEDGER_vNEXT.json', 'VERSE_NUMBERING_CROSSWALK_vNEXT.json', 'SOURCE_AUTHORITY_MATRIX.json', 'SOURCE_BIBLIOGRAPHY.json', 'HUMAN_EDITOR_DECISION_PACK_vNEXT.md'] };
state.updated_at = now;
write('RAMAVERSE_PROJECT_STATE.json', state);

console.log(JSON.stringify({ variants: ledger.cases.length, crosswalks: crosswalk.cases.length, canonicalModified: 0, stagingPublished: 0, mobilePackModified: 0 }));
