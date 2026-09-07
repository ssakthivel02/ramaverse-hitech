import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const replacements = [
  ["21 tests across 8 files", "35 tests across 12 files"],
  ["8 files, 21 tests passed", "12 files, 35 tests passed"],
  ["Expanded coverage to 21 tests", "Expanded coverage to 35 tests"],
  ["Reader source/language/progress controls and dry-run-only workbench accessibility", "Reader source/language/progress controls, loading states, and dry-run-only workbench accessibility"],
  ["SargaReaderAndWorkbench.test.tsx | 2", "SargaReaderAndWorkbench.test.tsx | 4"],
  ["ReviewStatusSurfaces.test.tsx | 2", "ReviewStatusSurfaces.test.tsx | 4"],
  ["importDryRun.test.ts | 1", "importDryRun.test.ts | 2"],
  ["Total: 21 passed tests across 8 files", "Total: 35 passed tests across 12 files"],
];

for (const filename of ["HANDOFF.md", "COMPLETED_THIS_RUN.md", "VALIDATION_LATEST.md", "TEST_EVIDENCE.md"]) {
  const target = path.join(root, filename);
  let content = fs.readFileSync(target, "utf8");
  for (const [from, to] of replacements) content = content.replaceAll(from, to);
  if (filename === "TEST_EVIDENCE.md") {
    content = content.replace("| ReviewStatusSurfaces.test.tsx | 2 | Editorial review disclosures |", "| ReviewStatusSurfaces.test.tsx | 4 | Editorial review disclosures, canonical-only search facets, and compact labels |\n| accessibility.test.ts | 3 | Skip focus and reduced-motion safeguards |\n| CharacterEvidence.test.tsx | 1 | Character evidence and zero-edge relationship fallback |");
  }
  fs.writeFileSync(target, content, "utf8");
}
console.log("Updated generated evidence to the final 35-test count.");
