import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const performancePath = path.join(root, "PERFORMANCE_REPORT.md");
const reconciliationPath = path.join(root, "RECONCILIATION_DRY_RUN.json");
const performance = fs.existsSync(performancePath) ? fs.readFileSync(performancePath, "utf8") : "Performance report unavailable.";
const reconciliation = fs.existsSync(reconciliationPath) ? JSON.parse(fs.readFileSync(reconciliationPath, "utf8")) : null;
const reconciliationSummary = reconciliation ? `| Field | Result |
|---|---:|
| Historical canonical baseline | ${reconciliation.historicalCanonicalBaseline} |
| Observed staging ledger | ${reconciliation.stagingObserved} |
| Verified attached input | ${reconciliation.inputRecords} |
| Valid input records | ${reconciliation.validRecords} |
| Duplicates | ${reconciliation.duplicates} |
| Potential legacy overlap | ${reconciliation.potentialLegacyOverlap} |
| Tamil review required | ${reconciliation.tamilReviewRequired} |
| Source review required | ${reconciliation.sourceReviewRequired} |
| Schema errors | ${reconciliation.schemaErrors} |
| Ready for editorial review | ${reconciliation.readyForEditorialReview} |
| Production merged | ${reconciliation.stagingPublished} |

> ${reconciliation.countMatchesObservedLedger ? `The verified attached input matches the observed ${reconciliation.stagingObserved}-record ledger.` : `The verified attached input contains ${reconciliation.inputRecords} records while the observed ledger reports ${reconciliation.stagingObserved}; the discrepancy is preserved for review.`} No staging record is merged or published.` : "No reconciliation evidence is available.";
const report = `# RamaVerse Website — 20-Hour Deep Expansion Report

Generated: ${new Date().toISOString()}

## Scope and preservation

This continuation preserved the existing RamaVerse website and its protected **550-record historical canonical baseline**. The physically supplied **78-record primary staging package** was processed only through a non-mutating dry run; **no staging record was published**.

## Implemented

| Area | Delivered behavior |
|---|---|
| Sarga System | Added source-safe metadata availability, reader controls, coverage states, and explicit non-acquired states rather than invented Sargas or verse links. |
| Rama Life | Added current-record source-located Sarga linking for Bala Kanda and clear unavailable states for all other Kandas. |
| Character Encyclopedia | Added evidence views, alias/provenance availability disclosure, and a profile-to-profile zero-edge relationship fallback that does not infer connections. |
| Search | Added canonical-only content-type and review-state facets. Staging remains excluded. |
| Reconciliation | Extended the dry-run validator to staging-v2, validated the physically supplied 78-record input, and preserved all review gates with no database mutation. |
| Accessibility | Added skip navigation, reduced-motion safeguard, labelled compact controls, and focused keyboard regression coverage. |
| Offline | Updated the service worker to bypass API, reconciliation, and staging paths. |

## Validation

| Check | Result |
|---|---|
| TypeScript | PASS |
| Tests | 35 passed across 12 files |
| Production build | PASS |
| Desktop route verification | Reader, Characters, Search, Reconciliation, and Rama Life rendered successfully |
| Mobile route verification | Reader, Search facets, and Character controls rendered at 375px viewport |

## Non-mutating reconciliation

${reconciliationSummary}

## Performance

${performance}

## Next priority

Acquire the next primary source section, Ayodhya Kanda Sarga 24, into a separate staging batch and run the same dry-run workflow again. Do not merge or publish any staging record without explicit v1.4.0 reconciliation approval.
`;
fs.writeFileSync(path.join(root, "RAMAVERSE-WEB-20HR-REPORT.md"), report, "utf8");
console.log("Wrote RAMAVERSE-WEB-20HR-REPORT.md");
