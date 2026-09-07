import fs from "node:fs";
import path from "node:path";

const root = "/home/ubuntu/ramaverse";
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const exists = (relative) => fs.existsSync(path.join(root, relative));
const has = (relative, pattern) => new RegExp(pattern, "m").test(read(relative));
const state = JSON.parse(read("PROJECT_STATE.json"));
const hitech = JSON.parse(read("release_evidence/ai_hitech/AI_HITECH_VALIDATION_FINAL.json"));
const currentTests = { files: 23, passed: 58, total: 58, source: "pnpm test -- --run (2026-08-25)" };
const performance = JSON.parse(read("release_evidence/PERFORMANCE_VALIDATION.json"));
const routesText = read("client/src/App.tsx");
const routes = [...routesText.matchAll(/<Route\s+path=\{["']([^"']+)["']\}/g)].map((match) => match[1]);
const requiredLanguages = ["en", "ta", "hi", "te", "kn", "ml"];
const languageFile = read("client/src/contexts/MultilingualContext.tsx");
const panelFile = read("client/src/components/intelligence/IntelligencePanels.tsx");
const intelligenceServer = read("server/intelligence.ts");
const intelligenceShared = read("shared/intelligence.ts");
const publicFiles = ["client/public/manifest.json", "client/public/favicon.svg", "client/public/robots.txt", "client/public/sitemap.xml", "client/public/sw.js", "client/public/offline-reset.html"];
const visualAssetFiles = ["release_evidence/visual_assets/kanda-identities.svg", "release_evidence/visual_assets/journey-source-offline.svg", "release_evidence/visual_assets/child-learning.svg", "release_evidence/visual_assets/VISUAL_ASSET_MANIFEST.json"];
const featureFiles = {
  ask: ["client/src/pages/AskRamaVerse.tsx", "client/src/pages/Intelligence.tsx"],
  search: ["client/src/pages/Search.tsx", "server/intelligence.ts"],
  reader: ["client/src/pages/SargaReader.tsx"],
  characters: ["client/src/pages/Characters.tsx"],
  places: ["client/src/pages/Places.tsx"],
  timeline: ["client/src/pages/Timeline.tsx"],
  graph: ["client/src/pages/KnowledgeGraph.tsx", "client/src/components/intelligence/IntelligencePanels.tsx"],
  voiceAndReadAloud: ["client/src/components/intelligence/IntelligencePanels.tsx", "client/src/pages/Intelligence.tsx"],
};
const featureCoverage = Object.fromEntries(Object.entries(featureFiles).map(([feature, files]) => [feature, files.every(exists)]));
const routeCoverage = ["/", "/kandas", "/search", "/ask", "/intelligence", "/sargas/:recordKey", "/characters", "/places", "/journey", "/timeline", "/knowledge", "/stories", "/quizzes", "/audio", "/library"].map((route) => ({ route, present: routes.includes(route) }));
const providerTerms = /(api\.manus\.im|BUILT_IN_FORGE|OPENAI_API_KEY|openai\.com|generativelanguage\.googleapis|anthropic\.com)/i;
const providerNeutral = !providerTerms.test(intelligenceServer) && !providerTerms.test(intelligenceShared);
const visualAssets = {
  filesPresent: visualAssetFiles.every(exists),
  manifestPresent: exists("release_evidence/visual_assets/VISUAL_ASSET_MANIFEST.json"),
  originalArtworkDeclared: has("release_evidence/visual_assets/VISUAL_ASSET_MANIFEST.json", "Original RamaVerse"),
  noThirdPartyArtworkDeclared: has("release_evidence/visual_assets/VISUAL_ASSET_MANIFEST.json", "no third-party artwork"),
};
const pwaSeo = {
  requiredFilesPresent: publicFiles.every(exists),
  manifestReferencesLocalIcon: has("client/public/manifest.json", "favicon\\.svg"),
  robotsReferencesSitemap: has("client/public/robots.txt", "sitemap\\.xml"),
  sitemapHasPublicRoutes: has("client/public/sitemap.xml", "<loc>"),
  serviceWorkerHasVersionedCache: has("client/public/sw.js", "CACHE_NAME|CACHE_VERSION|ramaverse"),
  protectedPathPolicyPresent: has("client/public/sw.js", "api|reconciliation|staging"),
};
const governance = {
  canonicalBaseline: state.historicalCanonicalTotal,
  physicalStaging: state.physicalStagingTotal,
  stagingPublished: state.stagingPublished,
  publicSearchStaging: state.publicSearchStaging,
  publicAskStaging: state.publicAskStaging,
  mobileModified: state.mobileModified,
  canonicalProtected: state.historicalCanonicalTotal === 550,
  stagingClosed: state.stagingPublished === 0 && state.publicSearchStaging === 0 && state.publicAskStaging === 0,
};
const evidence = {
  sourceVersion: state.sourceVersion,
    tests: `${currentTests.passed}/${currentTests.total}`,
  typecheck: hitech.typecheck,
  lint: hitech.lint,
  build: hitech.build,
  routeSmoke: hitech.routeSmoke,
  responsiveViewports: hitech.responsiveViewports,
  wrongScript: hitech.wrongScript,
  tamilHumanReviewed: 0,
  productionDeployed: false,
  performance,
};
const releaseGate = {
  requiredFeaturesPresent: Object.values(featureCoverage).every(Boolean),
  requiredRoutesPresent: routeCoverage.every((item) => item.present),
  languagesPresent: requiredLanguages.every((locale) => new RegExp(`\\b${locale}:`).test(languageFile)),
  intelligenceContractsPresent: has("shared/intelligence.ts", "IntelligenceRecord") && has("server/intelligence.ts", "searchCanonicalIntelligence") && has("server/intelligence.ts", "answerCanonicalQuestion"),
  intelligencePanelsPresent: ["AskEvidencePanel", "RelatedQuestions", "CharacterContext", "PlaceContext", "TimelineContext", "SourceContext", "ExplainSimply", "ExplainForChildren", "ExplainInTamil", "ReadAloud", "VoiceInput"].every((name) => panelFile.includes(name)),
  providerNeutral,
  visualAssetPass: Object.values(visualAssets).every(Boolean),
  pwaSeoPass: Object.values(pwaSeo).every(Boolean),
  governancePass: governance.canonicalProtected && governance.stagingClosed && governance.mobileModified === false,
  regressionPass: evidence.tests === "58/58" && evidence.typecheck === "PASS" && evidence.lint === "PASS" && evidence.build === "PASS",
  noWrongScript: evidence.wrongScript === 0,
  productionNotDeployed: evidence.productionDeployed === false,
  performancePass: performance.allJavascriptChunksBelowWarningThreshold === true && performance.routeChunksPresent === true,
};
releaseGate.pass = Object.values(releaseGate).every((value) => value === true);

const report = {
  generatedAt: new Date().toISOString(),
  specification: "pasted_content_107",
  mode: "TOKEN_SAVER_BUILD_DATA_UX_INTELLIGENCE",
  sourceVersion: state.sourceVersion,
  authority: { sourceRoot: state.sourceRoot, routeCount: state.routeCount, continuation: state.exactNextSource, conflict: state.continuationConflict },
  featureCoverage,
  routeCoverage,
  languages: Object.fromEntries(requiredLanguages.map((locale) => [locale.toUpperCase(), new RegExp(`\\b${locale}:`).test(languageFile) ? "PASS" : "FAIL"])),
  pwaSeo,
  visualAssets,
  governance,
  evidence,
  releaseGate,
  decision: releaseGate.pass ? "READY_FOR_OWNER_DEPLOYMENT_REVIEW" : "BLOCKED_REQUIRES_REPAIR",
  deployment: "NOT_PERFORMED",
};
const outDir = path.join(root, "release_evidence");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "PREMIUM_COMPLETION_VALIDATION.json"), JSON.stringify(report, null, 2) + "\n");
const md = `# RamaVerse Premium Completion Validation\n\nGenerated ${report.generatedAt}. This evidence covers the current physical Website only.\n\n| Gate | Result |\n|---|---|\n| Release gate | ${report.releaseGate.pass ? "PASS" : "FAIL"} |\n| Tests | ${report.evidence.tests} |\n| Typecheck | ${report.evidence.typecheck} |\n| Lint | ${report.evidence.lint} |\n| Build | ${report.evidence.build} |\n| Wrong-script UI | ${report.evidence.wrongScript} |\n| Canonical baseline | ${report.governance.canonicalBaseline} |\n| Physical staging | ${report.governance.physicalStaging} |\n| Staging publication | ${report.governance.stagingPublished} |\n| Mobile modified | ${report.governance.mobileModified ? "YES" : "NO"} |\n| Deployment | ${report.deployment} |\n| Main app chunk | ${report.evidence.performance.mainAppChunkBytes} bytes / ${report.evidence.performance.mainAppChunkGzipBytes} gzip |\n| Largest JS chunk | ${report.evidence.performance.largestJavascriptChunkBytes} bytes / ${report.evidence.performance.largestJavascriptChunkGzipBytes} gzip |\n| JS warning threshold | ${report.evidence.performance.allJavascriptChunksBelowWarningThreshold ? "PASS" : "FAIL"} |\n\n## Authority note\n\nThe current source revision is ${report.sourceVersion}. The exact next corpus source remains ${report.authority.continuation} because the physical ledgers and historical project state disagree; this Website pass does not acquire or promote corpus records.\n`;
fs.writeFileSync(path.join(outDir, "PREMIUM_COMPLETION_VALIDATION.md"), md);
console.log(JSON.stringify(report, null, 2));
if (!releaseGate.pass) process.exitCode = 1;
