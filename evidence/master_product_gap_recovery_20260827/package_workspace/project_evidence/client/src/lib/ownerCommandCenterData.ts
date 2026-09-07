export type OwnerStatus = "COMPLETE" | "PARTIAL" | "MISSING" | "REVIEW REQUIRED" | "NOT TESTED" | "FROZEN" | "PASS" | "BLOCKED";

export const OWNER_COMMAND_CENTER_GENERATED_AT = "2026-08-27T16:14:53Z";
export const OWNER_COMMAND_CENTER_EVIDENCE = [
  "RAMAVERSE_PROJECT_STATE.json",
  "release_evidence/global_hardening_20260827/RELEASE_STATE.json",
  "release_evidence/global_hardening_20260827/HEALTH_CONTRACT.json",
  "release_evidence/global_hardening_20260827/CORPUS_VERSION.json",
  "work_escrow_final/RAMAVERSE_COMPLETE_CORPUS_COVERAGE_MATRIX.json",
  "work_escrow_final/LANGUAGE_REGISTRY.json",
  "work_escrow_final/LANGUAGE_MATRIX.csv",
  "work_escrow_final/V1_5_PHYSICAL_DEVICE_QA_MATRIX.md",
  "work_escrow_final/WEBSITE_MOBILE_CORPUS_SYNC_REPORT_V4.md",
] as const;

export const ownerHealth = [
  { label: "Website", status: "PASS" as OwnerStatus, detail: "Current RC source and runtime smoke evidence available" },
  { label: "Mobile", status: "REVIEW REQUIRED" as OwnerStatus, detail: "Read-only candidate evidence; physical device QA not certified" },
  { label: "Corpus", status: "FROZEN" as OwnerStatus, detail: "Active v1.4.0 pointer; canonical baseline 550" },
  { label: "PWA", status: "PASS" as OwnerStatus, detail: "Manifest, service worker, cache reset, and upgrade boundaries validated" },
  { label: "Search", status: "PASS" as OwnerStatus, detail: "Canonical-only local retrieval; staging excluded" },
  { label: "Ask", status: "PASS" as OwnerStatus, detail: "Grounded canonical fallback; insufficient evidence is explicit" },
  { label: "Languages", status: "PARTIAL" as OwnerStatus, detail: "UI coverage broad; governed translated content remains partial" },
  { label: "Play release", status: "NOT TESTED" as OwnerStatus, detail: "No AAB upload or Play action performed" },
];

export const corpus = [
  ["Canonical count", "550", "FROZEN"], ["Active corpus", "v1.4.0", "FROZEN"], ["Candidate corpus", "1,092", "REVIEW REQUIRED"], ["Staging", "0 published", "PASS"], ["Quarantine", "158 source-evidence-only", "REVIEW REQUIRED"], ["Holds", "1 known Yuddha source hold", "REVIEW REQUIRED"], ["Variants", "3 unresolved textual variants", "REVIEW REQUIRED"], ["Source coverage", "Governed / 9 active source links", "PASS"], ["Kanda coverage", "7 Kandas", "PASS"], ["Sarga coverage", "645 reader entries", "PASS"],
] as const;

export const contentCoverage = [
  ["Rama life", "COMPLETE", "Rama Life route and governed records"], ["Rama Speaks", "PARTIAL", "Dialogue surfaces exist; editorial coverage remains incomplete"], ["Sita", "COMPLETE", "Character and source context available"], ["Hanuman", "COMPLETE", "Character and source context available"], ["Characters", "COMPLETE", "51 governed character pages"], ["Places", "COMPLETE", "25 governed place pages"], ["Journeys", "COMPLETE", "Journey Atlas route available"], ["Wisdom", "COMPLETE", "108 wisdom records"], ["Devotional works", "PARTIAL", "Tradition-separated surfaces; coverage varies"], ["Children", "COMPLETE", "Stories and quizzes surfaces"], ["Festivals", "PARTIAL", "No complete calendar contract evidenced"], ["Temples", "PARTIAL", "Place coverage exists; dedicated temple corpus is partial"], ["Audio", "COMPLETE", "30 audio scripts and read-aloud surface"],
] as const;

export const languages = [
  ["English", "en", "COMPLETE", "PARTIAL", "0 evidenced", "0 current UI-key gaps"], ["Tamil", "ta", "COMPLETE", "PARTIAL", "0 evidenced", "0 current UI-key gaps"], ["Hindi", "hi", "PARTIAL", "PENDING", "0 evidenced", "0 current UI-key gaps"], ["Telugu", "te", "PARTIAL", "PENDING", "0 evidenced", "0 current UI-key gaps"], ["Kannada", "kn", "PARTIAL", "PENDING", "0 evidenced", "0 current UI-key gaps"], ["Malayalam", "ml", "PARTIAL", "PENDING", "0 evidenced", "0 current UI-key gaps"],
] as const;

export const media = [
  ["Hero images", "MISSING", "CSS symbolic atmosphere; no approved image pack"], ["Kanda images", "MISSING", "Original art contract not evidenced"], ["Character images", "MISSING", "Source-cleared original art not evidenced"], ["Place images", "MISSING", "Source-cleared original art not evidenced"], ["Journey visuals", "PARTIAL", "CSS/SVG/map surfaces available"], ["Audio", "PARTIAL", "Scripts/read-aloud available; optional sound pack not evidenced"], ["Animations", "COMPLETE", "CSS motion primitives with reduced-motion fallback"],
] as const;

export const parity = [
  ["Home / discovery", "COMPLETE", "REVIEW REQUIRED", "Website route exists; Mobile parity not physically certified"], ["Seven Kandas", "COMPLETE", "REVIEW REQUIRED", "Website 7-Kanda explorer; Mobile evidence only"], ["Sarga Reader", "COMPLETE", "REVIEW REQUIRED", "645 reader entries; Mobile physical QA pending"], ["Search", "COMPLETE", "REVIEW REQUIRED", "Canonical-only local search; Mobile parity unverified"], ["Ask RamaVerse", "COMPLETE", "REVIEW REQUIRED", "Grounded local fallback; Mobile parity unverified"], ["Knowledge Graph", "COMPLETE", "REVIEW REQUIRED", "Provenance graph; semantic edges conservative"], ["Languages", "COMPLETE", "PARTIAL", "Six Tier-A Website UI locales; Mobile evidence pack only"], ["Library / bookmarks", "COMPLETE", "REVIEW REQUIRED", "Local Website library; Mobile parity unverified"], ["Walk with Rama", "COMPLETE", "MISSING", "Website RC route; no Mobile implementation"], ["Offline / PWA", "COMPLETE", "REVIEW REQUIRED", "Website service worker; Mobile contract unverified"],
] as const;

export const release = [
  ["Website deployment", "OWNER CONTROLLED / NOT DEPLOYED"], ["Active version", "v1.4.0 frozen pointer"], ["Rollback state", "Documented; not executed"], ["Mobile version", "Evidence-only; physical version must be confirmed"], ["versionCode", "Not physically confirmed in current Website workspace"], ["QA artifact", "V1_5_PHYSICAL_DEVICE_QA_MATRIX.md"], ["Physical QA", "NOT TESTED"], ["AAB", "NONE / not created in this task"], ["Play status", "NO ACTION"],
] as const;

export const quality = [
  ["Duplicate IDs", "0 current logical duplicates; historical evidence preserved separately", "PASS"], ["Dangling IDs", "0 in validated projections", "PASS"], ["Source holds", "1 known Yuddha source hold", "REVIEW REQUIRED"], ["Variants", "3 unresolved textual variants", "REVIEW REQUIRED"], ["Missing sources", "0 in validated current projections", "PASS"], ["Tamil human review", "0", "REVIEW REQUIRED"],
] as const;

export const ownerActions = [
  "Review and approve the Website production-candidate RC before any deployment.",
  "Resolve the one Yuddha source hold and three textual variants through the editorial authority process.",
  "Complete physical Mobile QA and confirm version/versionCode before any Play release action.",
  "Approve source-cleared original art and audio contracts before commissioning or integrating assets.",
  "Choose whether to define a complete festival, daily nama, transliteration, notification, and offline-pack contract.",
];
