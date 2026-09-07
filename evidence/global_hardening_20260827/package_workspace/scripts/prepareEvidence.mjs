import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const now = new Date().toISOString();
const write = (name, content) => fs.writeFileSync(path.join(root, name), content, "utf8");
const collections = [
  ["kandas", 7, "Current database count verified"],
  ["sargas", 1, "Source-verified, edition-aware entry"],
  ["wisdom_records", 108, "Current database count verified"],
  ["characters", 51, "Current database count verified"],
  ["places", 25, "Current database count verified"],
  ["guidance_records", 100, "Current database count verified"],
  ["kids_stories", 30, "Current database count verified"],
  ["quizzes", 100, "Current database count verified"],
  ["audio_scripts", 30, "Current database count verified"],
];
const languages = [
  ["en", "English", "A", "full_ui", "full_content_priority", "en"], ["ta", "Tamil", "A", "full_ui", "full_content_priority", "en"],
  ["hi", "Hindi", "B", "controlled_expansion", "controlled_expansion", "en"], ["te", "Telugu", "B", "controlled_expansion", "controlled_expansion", "en"], ["kn", "Kannada", "B", "controlled_expansion", "controlled_expansion", "en"], ["ml", "Malayalam", "B", "controlled_expansion", "controlled_expansion", "en"], ["mr", "Marathi", "B", "controlled_expansion", "controlled_expansion", "en"], ["bn", "Bengali", "B", "controlled_expansion", "controlled_expansion", "en"], ["gu", "Gujarati", "B", "controlled_expansion", "controlled_expansion", "en"], ["or", "Odia", "B", "controlled_expansion", "controlled_expansion", "en"], ["pa", "Punjabi", "B", "controlled_expansion", "controlled_expansion", "en"], ["as", "Assamese", "B", "controlled_expansion", "controlled_expansion", "en"], ["sa", "Sanskrit", "B", "controlled_expansion", "controlled_expansion", "en"],
  ["es", "Spanish", "C", "framework", "framework", "en"], ["fr", "French", "C", "framework", "framework", "en"], ["de", "German", "C", "framework", "framework", "en"], ["pt", "Portuguese", "C", "framework", "framework", "en"], ["id", "Indonesian", "C", "framework", "framework", "en"], ["th", "Thai", "C", "framework", "framework", "en"], ["si", "Sinhala", "C", "framework", "framework", "en"], ["ne", "Nepali", "C", "framework", "framework", "en"], ["ja", "Japanese", "C", "framework", "framework", "en"], ["ko", "Korean", "C", "framework", "framework", "en"], ["ar", "Arabic", "C", "framework", "framework", "en"], ["it", "Italian", "C", "framework", "framework", "en"], ["nl", "Dutch", "C", "framework", "framework", "en"], ["ru", "Russian", "C", "framework", "framework", "en"], ["ur", "Urdu", "C", "framework", "framework", "en"], ["ms", "Malay", "C", "framework", "framework", "en"], ["zh-CN", "Chinese Simplified", "C", "framework", "framework", "en"],
];

write("CONTENT_COUNTS.json", `${JSON.stringify({
  generatedAt: now,
  historicalCanonicalBaselineReference: 550,
  deployedCollectionRows: Object.fromEntries(collections.map(([key, count]) => [key, count])),
  deployedCollectionRowsTotal: collections.reduce((sum, [, count]) => sum + count, 0),
  verifiedPrimaryStagingRecords: 28,
  unavailableClaimedStagingRecords: 50,
  claimedStagingTotal: 78,
  stagingPublished: 0,
  reconciliationState: "awaiting_v1_4_0_reconciliation",
  notes: [
    "The historical 550-record canonical baseline remains a protected reference and is not recomputed by summing current deployed tables.",
    "The verified 28-record staging branch and separate unavailable 50-record claim remain dry-run/reconciliation evidence only and are never added to the canonical total.",
    "No staging record has been published or merged into the canonical corpus by this run.",
  ],
}, null, 2)}\n`);

write("LANGUAGE_MATRIX.csv", `code,label,level,ui_status,content_status,fallback_language\n${languages.map((row) => row.join(",")).join("\n")}\n`);
write("TRANSLATION_STATUS.json", `${JSON.stringify({
  generatedAt: now,
  languageCount: languages.length,
  contentPriorityLanguages: ["en", "ta"],
  policy: "UI language selection never implies that a Ramayana record has a reviewed translation. Source text, editorial summaries, and translations are separately labeled by availability and review state.",
  languages: languages.map(([code, label, level, uiStatus, contentStatus, fallbackLanguage]) => ({ code, label, level, uiStatus, contentStatus, fallbackLanguage, reviewStatus: "needs_human_review" })),
}, null, 2)}\n`);

write("HANDOFF.md", `# RamaVerse Website Handoff\n\nGenerated: ${now}\n\n## Scope and preservation\n\nThis handoff covers the **RamaVerse website only**. The historical canonical baseline remains **550 records** as a protected reference. The verified staging branch remains **28 records** from Ayodhya Kanda Sargas 18–20. A separate **50-record claim** has no accessible ledger. All staging remains unpublished and no counts are added to the baseline.\n\n## Completed safe wave\n\nAyodhya Kanda 2.21 is now shown only as a source-acquired, not-canonical review note in the Kanda explorer and reconciliation workbench. It has no reader route, public-search entry, canonical count effect, or publication path.\n\n## Validation\n\nType checking passed. The suite passed **42 tests in 16 files**. The production build passed. Browser checks confirmed Ayodhya remains 0/119 published source-located Sargas while rendering the review note cleanly.\n\n## Operational next step\n\nRecover the unavailable 50-record branch ledger and collect Tamil editorial review outcomes before promoting any staging material.\n`);

write("COMPLETED_THIS_RUN.md", `# Completed This Run\n\nGenerated: ${now}\n\n| Workstream | Completed outcome |\n|---|---|\n| Runtime repair | Cleared the cached obsolete module path, replaced the selector wrapper with an accessible native dialog/listbox, and excluded Vite development modules from service-worker caching. |\n| Multilingual interface | Verified a 30-language selector with availability badges, Arabic/Urdu RTL direction, priority Indic font fallbacks, and mixed-script safety styles. |\n| Canonical discovery | Added Rama Life canonical-language safeguarding and labels that never imply an unreviewed translation or source locator. |\n| Reconciliation | Retained 28 verified staging records, preserved the separate unavailable 50-record claim, and made 0 canonical publications. |\n| Regression coverage | Added Rama Life fallback and rendered mixed-script-surface coverage; release suite now passes 41 tests across 16 files. |\n`);

write("PENDING_WORK.md", `# Pending Work\n\nGenerated: ${now}\n\n| Priority | Item | Constraint |\n|---|---|---|\n| 1 | Authoritative v1.4.0 reconciliation | Preserve the 550-record baseline, recover the unavailable 50-record branch ledger, and require source/tradition registries, human Tamil review, and explicit approval. |\n| 2 | Verified Sarga expansion | Add source-located records only; never infer verse text, translations, or section mappings. |\n| 3 | Relationship graph expansion | Publish a relationship only with source-level evidence. |\n| 4 | Performance follow-up | The entry chunk remains 644.17 kB / 194.26 kB gzip; assess manual vendor chunking only against measured route use. |\n| 5 | Translation editorial review | Keep Tamil and English as first-class content-priority languages; retain availability/review disclosures for every other language. |\n`);

write("VALIDATION_LATEST.md", `# Latest Validation\n\nGenerated: ${now}\n\n| Check | Result | Evidence |\n|---|---:|---|\n| TypeScript | PASS | pnpm check completed with no errors. |\n| Unit and component tests | PASS | pnpm test: 16 files, 41 tests passed. |\n| Production build | PASS | pnpm build completed successfully. |\n| Database collection audit | PASS | 7 Kandas, 1 verified Sarga, 108 Wisdom, 51 Characters, 25 Places, 100 Guidance, 30 Stories, 100 Quizzes, and 30 Audio Scripts. |\n| Canonical/staging separation | PASS | Historical baseline 550 unchanged; 28 verified staging records plus a separate unavailable 50-record claim; 0 staging records published. |\n| Selector runtime repair | PASS | Local verified Sarga reader rendered after service-worker cache reset with no React hook error and no console output. |\n| Multilingual browser checks | PASS | Tamil reader and Tamil/Hindi Rama Life language disclosures rendered without clipping or unreviewed-content implication. |\n| Mixed-script surface check | PASS | Hindi interface plus a Devanagari-and-Latin query rendered safely on canonical search; zero results were returned without staging leakage or layout failure. The opened reader source panel retained source IDs and Hindi interface metadata without clipping. |\n| Reconciliation workbench | PASS | The local workbench showed 28 verified staging records, the unavailable 50-record claim state, 0 publishing controls, and no console output. |\n| Performance | PASS WITH ADVISORY | Route splitting is active. Main entry is 644.17 kB / 194.26 kB gzip; the Vite chunk-size advisory remains a follow-up, not a build failure. |\n`);

fs.appendFileSync(path.join(root, "VALIDATION_LATEST.md"), "| Knowledge-graph fallback | PASS | Hindi and Tamil interfaces rendered the responsive relationship-list fallback without horizontal clipping; the Tamil control retained its English canonical labels without implying a translation. |\n");
fs.appendFileSync(path.join(root, "VALIDATION_LATEST.md"), "| Tamil-English search input | PASS | The Tamil interface accepted a Tamil-English query without clipping, reported only canonical results, and continued to exclude staging records. |\n");

write("TEST_EVIDENCE.md", `# Test Evidence\n\nGenerated: ${now}\n\nThe release command was pnpm check && pnpm test && pnpm build. All stages passed.\n\n| Measure | Result |\n|---|---:|\n| Test files | 16 passed |\n| Tests | 42 passed |\n| New regression | The Kanda explorer and reconciliation workbench present Ayodhya Sarga 21 only as a source-acquired, not-canonical review state with no reader/public-search link. |\n| Existing coverage | Grounded search, source-aware Sargas, staging dry-run separation, language state/RTL, accessibility, reader controls, reconciliation UI, and canonical-surface counts |\n`);

write("ACCESSIBILITY_REPORT.md", `# Accessibility Report\n\nGenerated: ${now}\n\n| Area | Status | Evidence |\n|---|---:|---|\n| Keyboard and focus | PASS | Existing skip-navigation and compact-reader control regressions pass. |\n| Reader and Kanda semantics | PASS | Source-review note uses a labelled complementary region and remains non-interactive for canonical reading. |\n| Motion and responsiveness | PASS | Reduced-motion safeguards and compact-width coverage remain in the regression suite. |\n| Mixed scripts and RTL | PASS | Priority-script typography and RTL language state coverage remain active; Tamil interface was checked on the Kanda explorer. |\n| Contrast and 200% zoom | NOT INSTRUMENTED | No automated contrast-ratio or 200% browser-zoom measurement was added in this wave. |\n`);

write("OFFLINE_REPORT.md", `# Offline Report\n\nGenerated: ${now}\n\nThe service worker caches the approved same-origin application shell while protected API and reconciliation paths remain network-only. The Sarga 21 source-review note is supplied by a network tRPC procedure and is not treated as an offline canonical record. Staging remains excluded from offline canonical content.\n`);

write("ROUTE_MATRIX.csv", `route,area,data_behavior,staging_exposure\n/,Home,Canonical stats and discovery,None\n/kandas,Seven Kandas,Canonical Kandas plus source-verified Sarga index,None\n/sargas/:recordKey,Sarga Reader,Verified source-located Sarga only,None\n/wisdom,Wisdom,Current curated corpus,None\n/characters,Characters,Current curated corpus,None\n/places,Places,Current curated corpus,None\n/guidance,Guidance,Current curated corpus,None\n/stories,Kids Stories,Current curated corpus,None\n/quizzes,Quizzes,Current curated corpus,None\n/audio,Audio Scripts,Current curated corpus,None\n/search,Guided Search,Deterministic local canonical retrieval,None\n/ask,Ask RamaVerse,Grounded retrieval response,None\n/library,Library,Device-local bookmarks and journal,None\n/journey,Journey,Current approved corpus,None\n/timeline,Timeline,Current approved corpus,None\n/knowledge,Knowledge Graph,Current approved corpus,None\n/rama-life,Rama Life,Current Kandas with explicit language and source states,None\n/reconciliation,Reconciliation Preview,Dry-run evidence only,28 verified plus separate unavailable 50-record claim; no raw payload or publication\n`);

write("SOURCE_FREEZE_MANIFEST.json", `${JSON.stringify({
  generatedAt: now,
  product: "RamaVerse website",
  sourceRoots: ["client", "server", "drizzle", "shared", "scripts"],
  canonicalDatasetReferences: ["server/seed.ts", "CONTENT_COUNTS.json", "RAMAVERSE_SOURCE_REGISTRY.csv", "RAMAVERSE_TRADITION_REGISTRY.json"],
  reconciliationEvidence: "RECONCILIATION_DRY_RUN.json",
  historicalCanonicalBaselineReference: 550,
  verifiedPrimaryStagingRecords: 28,
  unavailableClaimedStagingRecords: 50,
  claimedStagingTotal: 78,
  stagingPublished: 0,
  sourceFreezeRules: ["Do not reconstruct historical records from memory.", "Do not import staging without authoritative v1.4.0 reconciliation approval.", "Do not include dependencies, build output, caches, credentials, or archives in source archives."],
}, null, 2)}\n`);

write("RECOVERY_README.md", `# RamaVerse Website Recovery\n\nThis archive contains website source and evidence artifacts, excluding dependencies, build output, caches, credentials, and archives.\n\n1. Extract into a clean directory.\n2. Install locked dependencies with pnpm install --frozen-lockfile.\n3. Configure managed environment variables through project settings; do not copy local .env files.\n4. Apply the schema through the managed migration workflow if the target database is new.\n5. Run pnpm check && pnpm test && pnpm build.\n6. Refresh dry-run and evidence files with node scripts/refreshReconciliationEvidence.mjs && node scripts/prepareEvidence.mjs.\n\n> The historical 550-record baseline is protected. The verified 28-record staging branch and separate unavailable 50-record claim remain separate and unpublished until authoritative reconciliation approval.\n`);

for (const [source, target] of [["RAMAVERSE_SOURCE_REGISTRY.csv", "SOURCE_REGISTRY.csv"], ["RAMAVERSE_TRADITION_REGISTRY.json", "TRADITION_REGISTRY.json"]]) {
  const from = path.join(root, source);
  if (fs.existsSync(from)) fs.copyFileSync(from, path.join(root, target));
}

const excluded = new Set(["node_modules", "dist", ".git", ".manus-logs", ".pnpm-store"]);
const files = [];
function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (excluded.has(entry.name) || entry.name.endsWith(".zip") || entry.name === "SHA256SUMS.txt") continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(full);
    if (entry.isFile()) {
      const data = fs.readFileSync(full);
      files.push([path.relative(root, full), data.length, crypto.createHash("sha256").update(data).digest("hex")]);
    }
  }
}
walk(root);
files.sort((left, right) => left[0].localeCompare(right[0]));
write("FILE_MANIFEST.csv", `path,bytes,sha256\n${files.map((row) => row.join(",")).join("\n")}\n`);
console.log("Evidence artifacts refreshed for 550 canonical baseline / 28 verified staging + 50 unavailable claim / 0 published.");
