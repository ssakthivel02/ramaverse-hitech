import { readFileSync, writeFileSync } from "node:fs";
const root = "/home/ubuntu/ramaverse";
const ledger = JSON.parse(readFileSync(`${root}/data/reconciliation_vnext/RAMAVERSE-WEB-CORPUS-vNEXT-RECONCILIATION-LEDGER.json`, "utf8"));
const unresolved = ledger.records.filter((record) => record.source_refs_unresolved.length).map((record) => ({ id: record.record_id, source_refs_unresolved: record.source_refs_unresolved, occurrences: record.occurrences, disposition: record.disposition }));
const dispositionExamples = Object.fromEntries(Object.keys(ledger.counts).map((key) => [key, ledger.records.filter((record) => record.disposition === key).slice(0, 3).map((record) => ({ id: record.record_id, type: record.record_type, refs: record.source_ids, variant: record.variant_status, merge: record.merge_state, publication: record.publication_state }))]));
const report = { generatedAt: new Date().toISOString(), physicalOccurrences: ledger.physicalOccurrences, uniquePhysicalRecords: ledger.uniquePhysicalRecords, sourceRegistryEntries: ledger.sourceRegistryEntries, invalidSourceRefs: ledger.invalidSourceRefs, unresolved, dispositionExamples };
writeFileSync(`${root}/release_evidence/RECONCILIATION_AUDIT_2026-08-26.json`, JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify({ invalidSourceRefs: report.invalidSourceRefs, unresolvedCount: unresolved.length, firstUnresolved: unresolved.slice(0, 25), dispositionExamples }, null, 2));
