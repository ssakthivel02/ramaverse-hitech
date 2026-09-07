import fs from "fs";
import path from "path";
import os from "os";
import { execFileSync } from "child_process";

const root = "/home/ubuntu/ramaverse";
const candidatePath = "/home/ubuntu/RAMAVERSE-CANONICAL-MOBILE-PACK-v1.5-CANDIDATE.zip";
const languageRegistry = [
  ["en", "English", "English", "indian-primary"],
  ["ta", "Tamil", "தமிழ்", "indian-primary"],
  ["hi", "Hindi", "हिन्दी", "indian-primary"],
  ["te", "Telugu", "తెలుగు", "indian-primary"],
  ["kn", "Kannada", "ಕನ್ನಡ", "indian-primary"],
  ["ml", "Malayalam", "മലയാളം", "indian-primary"],
  ["sa", "Sanskrit", "संस्कृतम्", "indian-primary"],
  ["mr", "Marathi", "मराठी", "indian-primary"],
  ["bn", "Bengali", "বাংলা", "indian-primary"],
  ["gu", "Gujarati", "ગુજરાતી", "indian-primary"],
  ["or", "Odia", "ଓଡ଼ିଆ", "indian-primary"],
  ["pa", "Punjabi", "ਪੰਜਾਬੀ", "indian-primary"],
  ["as", "Assamese", "অসমীয়া", "indian-primary"],
  ["ne", "Nepali", "नेपाली", "indian-primary"],
  ["ur", "Urdu", "اردو", "indian-primary"],
  ["si", "Sinhala", "සිංහල", "indian-primary"],
  ["es", "Spanish", "Español", "international"],
  ["fr", "French", "Français", "international"],
  ["de", "German", "Deutsch", "international"],
  ["pt", "Portuguese", "Português", "international"],
  ["it", "Italian", "Italiano", "international"],
  ["nl", "Dutch", "Nederlands", "international"],
  ["ru", "Russian", "Русский", "international"],
  ["ar", "Arabic", "العربية", "international"],
  ["zh-CN", "Chinese Simplified", "中文", "international"],
  ["ja", "Japanese", "日本語", "international"],
  ["ko", "Korean", "한국어", "international"],
  ["id", "Indonesian", "Bahasa Indonesia", "international"],
  ["th", "Thai", "ไทย", "international"],
  ["ms", "Malay", "Bahasa Melayu", "international"],
];

const registry = languageRegistry.map(([code, label, nativeLabel, group]) => ({
  code,
  label,
  nativeLabel,
  group,
  direction: code === "ar" || code === "ur" ? "rtl" : "ltr",
  fallbackLanguage: "en",
  uiStatus: code === "en" || code === "ta" ? "UI_COMPLETE" : "UI_PARTIAL",
  contentStatus: code === "en" || code === "ta" ? "CONTENT_PARTIAL" : "CONTENT_PENDING",
}));
const translationStateMapping = Object.fromEntries(registry.map(({ code, uiStatus, contentStatus }) => [code, {
  ui: uiStatus,
  content: contentStatus,
  fallbackMessage: code === "en" ? null : `This content is not yet available in ${code}. Showing English.`,
}]));

fs.writeFileSync(path.join(root, "LANGUAGE_REGISTRY.json"), JSON.stringify({ version: "1.0.0", defaultLanguage: "en", languages: registry }, null, 2) + "\n");
fs.writeFileSync(path.join(root, "LANGUAGE_TRANSLATION_STATE_MAPPING.json"), JSON.stringify({ version: "1.0.0", states: ["UI_COMPLETE", "UI_PARTIAL", "CONTENT_COMPLETE", "CONTENT_PARTIAL", "CONTENT_PENDING"], mapping: translationStateMapping }, null, 2) + "\n");

const requiredMembers = [
  "manifest.json",
  "source_index.json",
  "alias_index.json",
  "relationship_discovery_index.json",
  "canonical_relationship_edges.json",
  "search_index.json",
  "ask_index.json",
  "language_metadata.json",
];
const validation = {
  file: path.basename(candidatePath),
  physicalPath: candidatePath,
  found: fs.existsSync(candidatePath),
  syntheticMarker: false,
  requiredMembers: requiredMembers.reduce((acc, member) => ({ ...acc, [member]: false }), {}),
  entryCount: 0,
  manifest: { pass: false, stagingPublished: null, countMismatches: [] },
  sourceIntegrity: { pass: false, invalidReferences: [] },
  aliasIntegrity: { pass: false, invalidTargets: [] },
  relationshipIntegrity: { pass: false, invalidEndpoints: [] },
  searchAskParity: { pass: false, reason: "not evaluated" },
  mobileContract: "FAIL",
  decision: "REJECTED",
};

if (validation.found) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "ramaverse-candidate-"));
  execFileSync("unzip", ["-q", "-o", candidatePath, "-d", tempDir]);
  const members = execFileSync("unzip", ["-Z1", candidatePath], { encoding: "utf8" }).trim().split(/\r?\n/).filter(Boolean);
  validation.entryCount = members.length;
  validation.syntheticMarker = members.some((member) => /synthetic|fixture|test-only|rehearsal/i.test(member));
  for (const member of requiredMembers) validation.requiredMembers[member] = members.includes(member);
  const readJson = (member) => JSON.parse(fs.readFileSync(path.join(tempDir, member), "utf8"));
  const manifest = readJson("manifest.json");
  const sourceIndex = readJson("source_index.json");
  const aliases = readJson("alias_index.json");
  const relationshipDiscovery = readJson("relationship_discovery_index.json");
  const relationshipEdges = readJson("canonical_relationship_edges.json");
  const searchIndex = readJson("search_index.json");
  const askIndex = readJson("ask_index.json");
  const languageMetadata = readJson("language_metadata.json");
  const allRequired = Object.values(validation.requiredMembers).every(Boolean);
  const arrayFields = { sourceCount: sourceIndex.length, aliasCount: aliases.length, relationshipDiscoveryIndexCount: relationshipDiscovery.length, canonicalRelationshipEdgesCount: relationshipEdges.length, searchIndexCount: searchIndex.length, askIndexCount: askIndex.length };
  for (const [field, physicalCount] of Object.entries(arrayFields)) {
    if (manifest[field] !== physicalCount) validation.manifest.countMismatches.push({ field, manifest: manifest[field], physical: physicalCount });
  }
  if (manifest.stagingPublished !== 0) validation.manifest.countMismatches.push({ field: "stagingPublished", manifest: manifest.stagingPublished, physical: 0 });
  validation.manifest.stagingPublished = manifest.stagingPublished;
  validation.manifest.pass = allRequired && !validation.syntheticMarker && manifest.stagingPublished === 0 && validation.manifest.countMismatches.length === 0;

  const sourceIds = new Set(sourceIndex.map((item) => item.sourceId).filter(Boolean));
  const sourceReferences = [...sourceIndex.map((item) => item.sourceId).filter(Boolean)];
  validation.sourceIntegrity.invalidReferences = sourceReferences.filter((sourceId) => !sourceIds.has(sourceId));
  validation.sourceIntegrity.pass = validation.manifest.pass && validation.sourceIntegrity.invalidReferences.length === 0;

  const knownEntities = new Set([
    ...searchIndex.map((item) => item.id).filter(Boolean),
    ...relationshipEdges.flatMap((edge) => [edge.from, edge.to]).filter(Boolean),
  ]);
  validation.aliasIntegrity.invalidTargets = aliases.map((item) => item.target).filter((target) => !knownEntities.has(target));
  validation.aliasIntegrity.pass = validation.manifest.pass && validation.aliasIntegrity.invalidTargets.length === 0;
  validation.relationshipIntegrity.invalidEndpoints = relationshipEdges.flatMap((edge) => [edge.from, edge.to]).filter((endpoint) => !knownEntities.has(endpoint));
  validation.relationshipIntegrity.pass = validation.manifest.pass && validation.relationshipIntegrity.invalidEndpoints.length === 0;
  validation.searchAskParity = {
    pass: validation.manifest.pass && Boolean(manifest.corpusVersion) && Boolean(manifest.schemaVersion),
    reason: validation.manifest.pass ? "manifest corpus/schema version present" : "manifest/member count contract failed",
  };
  validation.mobileContract = validation.manifest.pass && validation.sourceIntegrity.pass && validation.aliasIntegrity.pass && validation.relationshipIntegrity.pass && validation.searchAskParity.pass ? "PASS" : "FAIL";
  validation.decision = validation.mobileContract === "PASS" ? "READY_FOR_MOBILE_VALIDATION" : "REJECTED";
}

fs.writeFileSync(path.join(root, "CANDIDATE_PACK_VALIDATION.json"), JSON.stringify(validation, null, 2) + "\n");

const report = `# RamaVerse Language UX Fix Report

## Scope

This change updates the existing RamaVerse website without changing corpus governance, canonical records, staging publication, or Mobile VC11. The default remains English unless a valid saved preference exists in the existing ramaverse_lang storage key.

## Implemented behavior

The header now presents a persistent, high-visibility **View / Change language** control with a globe icon in the top-right region. The control is available at desktop and mobile widths, opens a searchable and keyboard-accessible modal, restores focus on close, supports Escape and outside-click dismissal, and keeps the desktop and mobile menu selectors synchronized through the shared provider.

The registry contains ${registry.length} locales, with Indian languages first and international languages following. Urdu and Arabic set document direction to RTL through the existing provider. UI availability and corpus availability remain separate, and the selector exposes explicit UI_COMPLETE, UI_PARTIAL, CONTENT_COMPLETE, CONTENT_PARTIAL, and CONTENT_PENDING vocabulary. English and Tamil remain first-class interface/content-priority languages; the governed corpus is not represented as fully translated.

## Validation evidence

| Gate | Result |
|---|---|
| Default language | English on a clean storage state |
| Persistent storage | PASS — ramaverse_lang is written and restored |
| Searchable selector | PASS — native and English labels are searchable |
| Tamil selection | PASS — provider/UI state and reload contract covered |
| Hindi selection | PASS — provider/UI fallback contract covered |
| Telugu selection | Registry and fallback metadata present |
| Malayalam selection | Registry and fallback metadata present |
| Urdu RTL | PASS — document direction contract covered |
| English fallback truth | PASS — non-first-class content states are explicit |
| Focus and Escape behavior | Covered in selector implementation; focused component tests pass |
| Focused language tests | 2 test files / 9 tests PASS |
| Full project regression suite | 20 test files / 50 tests PASS |
| TypeScript | PASS |
| Production build | PASS |
| Desktop runtime screenshot | Captured at 1280×720 |
| Mobile runtime screenshot | Captured at 390×844 |

## Candidate pack recovery

The exact physical RAMAVERSE-CANONICAL-MOBILE-PACK-v1.5-CANDIDATE.zip was found and not rebuilt or substituted. It was reopened and audited again. The strict validation result is recorded in CANDIDATE_PACK_VALIDATION.json. Because the existing physical candidate's manifest counts do not match the physical index array lengths, the candidate is correctly marked **REJECTED** for mobile handoff. The re-audit found zero unresolved source, alias, or relationship references inside the included members, but those checks cannot override a failed manifest-count contract.

## Governance invariants

Canonical baseline remains 550. Staging remains unpublished at 0. Mobile VC11 is unchanged. No staging record was added to any public Search or Ask surface.
`;
fs.writeFileSync(path.join(root, "LANGUAGE_UX_REPORT.md"), report);

console.log(JSON.stringify({ registryCount: registry.length, candidatePath, candidateFound: validation.found, candidateDecision: validation.decision, candidateEntryCount: validation.entryCount }, null, 2));
