import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const root = "/home/ubuntu/ramaverse";
const outDir = path.join(root, "data", "reconciliation_vnext");
mkdirSync(outDir, { recursive: true });
const excludedDirs = new Set(["node_modules", "dist", ".git", ".manus-logs", "release_evidence", "coverage", "work_escrow", "scripts"]);
const isExcluded = (relative) => relative.split(path.sep).some((part) => excludedDirs.has(part));
function walk(dir, relative = "") {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const rel = path.join(relative, entry.name);
    if (isExcluded(rel)) continue;
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(abs, rel));
    else if (entry.isFile() && entry.name.toLowerCase().endsWith(".json")) out.push(rel);
  }
  return out;
}
function stableJson(value) {
  if (Array.isArray(value)) return value.map(stableJson);
  if (!value || typeof value !== "object") return value;
  return Object.keys(value).sort().reduce((acc, key) => { if (!["created_at", "createdAt", "updated_at", "updatedAt", "retrieval_date"].includes(key)) acc[key] = stableJson(value[key]); return acc; }, {});
}
function sha(value) { return createHash("sha256").update(JSON.stringify(stableJson(value))).digest("hex"); }
function recordId(value) { return value?.record_id ?? value?.recordId ?? value?.id ?? null; }
function looksLikeRecord(value) {
  return value && typeof value === "object" && recordId(value) && (value.record_type || value.recordType) && (value.source_locator || value.sourceLocator || value.source_reference || value.sourceReference || value.source_ids || value.sourceIds);
}
const jsonFiles = walk(root);
const sourceRegistryIds = new Set();
for (const relative of jsonFiles) {
  if (!/(source|registry)/i.test(relative)) continue;
  let parsed;
  try { parsed = JSON.parse(readFileSync(path.join(root, relative), "utf8")); } catch { continue; }
  const scan = (value) => {
    if (Array.isArray(value)) return value.forEach(scan);
    if (!value || typeof value !== "object") return;
    if (value.source_id || value.sourceId) sourceRegistryIds.add(value.source_id ?? value.sourceId);
    Object.values(value).forEach((child) => { if (child && typeof child === "object") scan(child); });
  };
  scan(parsed);
}
const occurrences = [];
for (const relative of jsonFiles) {
  if (relative.startsWith(path.join("data", "reconciliation_vnext")) || relative.endsWith(".min.json")) continue;
  let parsed;
  try { parsed = JSON.parse(readFileSync(path.join(root, relative), "utf8")); } catch { continue; }
  const arrays = [];
  if (Array.isArray(parsed)) arrays.push({ key: "$", values: parsed });
  if (parsed && typeof parsed === "object") for (const [key, value] of Object.entries(parsed)) if (Array.isArray(value)) arrays.push({ key, values: value });
  for (const { key, values } of arrays) for (const value of values) if (looksLikeRecord(value)) occurrences.push({ file: relative, array: key, record: value, contentHash: sha(value) });
}
const byId = new Map();
for (const occurrence of occurrences) {
  const id = recordId(occurrence.record);
  if (!byId.has(id)) byId.set(id, []);
  byId.get(id).push(occurrence);
}
const get = (r, ...keys) => keys.map((key) => r[key]).find((value) => value !== undefined && value !== null && value !== "");
function disposition(occurrencesForId) {
  const r = occurrencesForId.find((occurrence) => get(occurrence.record, "source_ids", "sourceIds", "source_reference", "sourceReference"))?.record ?? occurrencesForId[0].record;
  const sameHashes = new Set(occurrencesForId.map((o) => o.contentHash)).size === 1;
  const source = get(r, "source_locator", "sourceLocator", "source_reference", "sourceReference", "source_ids", "sourceIds");
  const confidence = Number(get(r, "source_confidence", "sourceConfidence") ?? 0);
  const tradition = String(get(r, "source_tradition", "sourceTradition", "tradition_classification", "traditionClassification") ?? "").toUpperCase();
  const variant = String(get(r, "variant_status", "variantStatus") ?? "").toUpperCase();
  const merge = String(get(r, "merge_state", "mergeState") ?? "").toUpperCase();
  const pub = String(get(r, "publication_state", "publicationState") ?? "").toUpperCase();
  const type = String(get(r, "record_type", "recordType") ?? "").toUpperCase();
  if (occurrencesForId.length > 1 && sameHashes) return "IDENTICAL_DUPLICATE";
  if (occurrencesForId.length > 1 && !sameHashes) return "SEMANTIC_OVERLAP";
  const sourceValues = (Array.isArray(source) ? source : source ? [source] : []).filter(Boolean);
  const unresolvedSources = sourceValues.filter((value) => !sourceRegistryIds.has(value));
  if (!source || !confidence || unresolvedSources.length) return "SOURCE_HOLD";
  if (variant.includes("PENDING") || variant.includes("VARIANT") || variant.includes("REVIEW")) return "VARIANT_HOLD";
  if (["LATER_TEXT", "REGIONAL_TRADITION", "FOLK_TRADITION", "SCHOLARLY_INTERPRETATION"].some((token) => tradition.includes(token))) return "TEXTUAL_HOLD";
  if (merge.includes("ENTITY") || type.includes("RELATIONSHIP") && !get(r, "relationships")) return "ENTITY_HOLD";
  if (pub.includes("PUBLISHED") && !pub.includes("UNPUBLISHED")) return "EXISTING_CANONICAL";
  if (merge.includes("ENRICH") || ["CHARACTER_REFERENCE", "RELATIONSHIP", "PLACE", "JOURNEY"].includes(type)) return "SAFE_ENRICHMENT";
  if (tradition.includes("PRIMARY_TEXT") && confidence >= 0.9 && (merge.includes("QUARANTINED") || pub.includes("STAGING") || pub === "")) return "SAFE_NEW";
  return "SOURCE_HOLD";
}
const records = [...byId.entries()].map(([id, list]) => {
  const r = list.find((occurrence) => get(occurrence.record, "source_ids", "sourceIds", "source_reference", "sourceReference"))?.record ?? list[0].record;
  const rawSources = get(r, "source_ids", "sourceIds", "source_reference", "sourceReference");
  const sourceValues = (Array.isArray(rawSources) ? rawSources : rawSources ? [rawSources] : []).filter(Boolean);
  const resolvedSourceRefs = sourceValues.filter((source) => sourceRegistryIds.has(source));
  const record = { record_id: id, record_type: get(r, "record_type", "recordType") ?? null, kanda: get(r, "kanda"), kanda_number: get(r, "kanda_number", "kandaNumber"), sarga: get(r, "sarga"), sarga_number: get(r, "sarga_number", "sargaNumber"), source_ids: sourceValues, source_locator: get(r, "source_locator", "sourceLocator"), tradition: get(r, "source_tradition", "sourceTradition", "tradition_classification", "traditionClassification"), confidence: Number(get(r, "source_confidence", "sourceConfidence") ?? 0), source_refs_resolved: resolvedSourceRefs, source_refs_unresolved: sourceValues.filter((source) => !sourceRegistryIds.has(source)), tamil_review_state: get(r, "tamil_review_state", "tamilReviewState"), variant_status: get(r, "variant_status", "variantStatus"), merge_state: get(r, "merge_state", "mergeState"), publication_state: get(r, "publication_state", "publicationState"), english_explanation: get(r, "summary_en", "summaryEn", "content_en", "contentEn", "title_en", "titleEn") ?? "", occurrences: list.map((o) => ({ file: o.file, array: o.array, content_hash: o.contentHash })) };
  const primaryDisposition = disposition(list);
  return { ...record, disposition: primaryDisposition, promotion_eligible: primaryDisposition === "SAFE_NEW" || primaryDisposition === "SAFE_ENRICHMENT" };
});
const counts = Object.fromEntries(["EXISTING_CANONICAL", "SAFE_NEW", "SAFE_ENRICHMENT", "IDENTICAL_DUPLICATE", "SEMANTIC_OVERLAP", "VARIANT_HOLD", "SOURCE_HOLD", "ENTITY_HOLD", "TEXTUAL_HOLD", "REJECTED"].map((key) => [key, records.filter((r) => r.disposition === key).length]));
const safeNew = records.filter((r) => r.disposition === "SAFE_NEW");
const safeEnrichments = records.filter((r) => r.disposition === "SAFE_ENRICHMENT");
const approved = [...safeNew, ...safeEnrichments];
const searchIndex = approved.map((r) => ({ id: r.record_id, type: r.record_type, title: r.english_explanation.slice(0, 120), kanda: r.kanda, sarga: r.sarga, source_locator: r.source_locator, confidence: r.confidence, evidence_class: r.disposition }));
const askIndex = searchIndex.map((r) => ({ ...r, answer_policy: "Answer only from this approved candidate record; otherwise say insufficient evidence." }));
const readerMappings = approved.filter((r) => r.sarga_number || r.sarga).map((r) => ({ id: r.record_id, sarga: r.sarga, sarga_number: r.sarga_number, source_locator: r.source_locator, evidence_class: r.disposition }));
const entityProjections = approved.filter((r) => ["CHARACTER_REFERENCE", "RELATIONSHIP", "PLACE", "JOURNEY"].includes(String(r.record_type).toUpperCase())).map((r) => ({ id: r.record_id, type: r.record_type, kanda: r.kanda, sarga: r.sarga, source_locator: r.source_locator, evidence_class: r.disposition }));
const timelineProjections = approved.filter((r) => ["EVENT", "SARGA", "JOURNEY"].includes(String(r.record_type).toUpperCase())).map((r) => ({ id: r.record_id, type: r.record_type, kanda: r.kanda, sarga: r.sarga, source_locator: r.source_locator, evidence_class: r.disposition }));
const master = { generatedAt: new Date().toISOString(), specification: "pasted_content_108", mode: "RECONCILE_INTEGRATE_VALIDATE", canonicalBaseline: 550, websiteStagingBaseline: 398, stagingPublished: 0, mobileModified: false, productionMutation: 0, sourceRegistryEntries: sourceRegistryIds.size, physicalOccurrences: occurrences.length, uniquePhysicalRecords: records.length, oneDispositionPerUniqueRecord: records.every((r) => Boolean(r.disposition)), invalidSourceRefs: records.reduce((total, record) => total + record.source_refs_unresolved.length, 0), counts, records, notes: ["Canonical 550 remains a protected historical baseline and is not copied into this staging ledger.", "All records remain non-publishing until editorial/source authority approval.", "Tamil draft states are preserved; no record is marked HUMAN_REVIEWED by this process."] };
writeFileSync(path.join(outDir, "RAMAVERSE-WEB-CORPUS-vNEXT-RECONCILIATION-LEDGER.json"), JSON.stringify(master, null, 2) + "\n");
writeFileSync(path.join(outDir, "RAMAVERSE-WEB-CORPUS-vNEXT-CANDIDATE.json"), JSON.stringify({ generatedAt: master.generatedAt, baseCanonical: 550, safeNew, safeEnrichments, resultingCanonicalCandidate: 550 + safeNew.length, enrichmentsExcludedFromCount: safeEnrichments.length, stagingPublished: 0, publicationState: "CANDIDATE_ONLY_NOT_PRODUCTION" }, null, 2) + "\n");
writeFileSync(path.join(outDir, "SEARCH_INDEX-vNEXT-CANDIDATE.json"), JSON.stringify({ generatedAt: master.generatedAt, stagingExcluded: true, documents: searchIndex }, null, 2) + "\n");
writeFileSync(path.join(outDir, "ASK_INDEX-vNEXT-CANDIDATE.json"), JSON.stringify({ generatedAt: master.generatedAt, stagingExcluded: true, documents: askIndex }, null, 2) + "\n");
writeFileSync(path.join(outDir, "READER_MAPPINGS-vNEXT-CANDIDATE.json"), JSON.stringify({ generatedAt: master.generatedAt, stagingExcluded: true, mappings: readerMappings }, null, 2) + "\n");
writeFileSync(path.join(outDir, "ENTITY_PROJECTIONS-vNEXT-CANDIDATE.json"), JSON.stringify({ generatedAt: master.generatedAt, stagingExcluded: true, entities: entityProjections }, null, 2) + "\n");
writeFileSync(path.join(outDir, "TIMELINE_PROJECTIONS-vNEXT-CANDIDATE.json"), JSON.stringify({ generatedAt: master.generatedAt, stagingExcluded: true, events: timelineProjections }, null, 2) + "\n");
writeFileSync(path.join(outDir, "CORPUS_RECONCILIATION_SUMMARY.md"), `# RamaVerse Corpus vNext Reconciliation\n\nGenerated ${master.generatedAt}. This process did not mutate the 550-record historical canonical baseline, publish staging, modify Mobile, or resolve unresolved textual variants.\n\n| Measure | Count |\n|---|---:|\n| Historical canonical baseline | 550 |\n| Website staging baseline | 398 |\n| Physical record occurrences inspected | ${occurrences.length} |\n| Unique physical records | ${records.length} |\n| Safe new | ${counts.SAFE_NEW} |\n| Safe enrichments | ${counts.SAFE_ENRICHMENT} |\n| Identical duplicates | ${counts.IDENTICAL_DUPLICATE} |\n| Semantic overlaps | ${counts.SEMANTIC_OVERLAP} |\n| Variant holds | ${counts.VARIANT_HOLD} |\n| Source holds | ${counts.SOURCE_HOLD} |\n| Entity holds | ${counts.ENTITY_HOLD} |\n| Textual holds | ${counts.TEXTUAL_HOLD} |\n| Resulting canonical candidate | ${550 + counts.SAFE_NEW} |\n| Staging published | 0 |\n\n## Boundary\n\nThe Website production Search, Ask, Reader, and other runtime projections remain canonical-only. The candidate projections in this directory are quarantined release evidence and are not wired into production.\n`);
console.log(JSON.stringify({ output: outDir, physicalOccurrences: occurrences.length, uniquePhysicalRecords: records.length, counts, resultingCanonicalCandidate: 550 + counts.SAFE_NEW, search: searchIndex.length, ask: askIndex.length, reader: readerMappings.length, graph: entityProjections.length, timeline: timelineProjections.length }, null, 2));
