import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "..");
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

describe("RamaVerse repository governance contract", () => {
  const governance = read("REPOSITORY_GOVERNANCE.md");
  const codeowners = read(".github/CODEOWNERS");
  const prTemplate = read(".github/pull_request_template.md");

  it("assigns explicit ownership to the canonical RamaVerse repository surfaces", () => {
    expect(codeowners).toContain("* @ssakthivel02");
    expect(codeowners).toContain("/CURRENT_PROJECT_AUTHORITY.json @ssakthivel02");
    expect(codeowners).toContain("/CONTINUATION_AUTHORITY.json @ssakthivel02");
    expect(codeowners).toContain("/data/corpus/ @ssakthivel02");
    expect(codeowners).toContain("/data/staging/ @ssakthivel02");
    expect(codeowners).toContain("/server/ @ssakthivel02");
    expect(codeowners).toContain("/client/ @ssakthivel02");
  });

  it("requires collision checks and exact-SHA evidence before merge", () => {
    for (const marker of [
      "fresh-checked exact `main`",
      "open PRs, open issues, queued/running Actions",
      "No other active task is modifying the same area",
      "Base SHA: `REPLACE_WITH_EXACT_SHA`",
      "Exact-head CI is green before merge",
      "rechecked immediately before merge",
      "Post-merge `main` workflows",
    ]) {
      expect(prTemplate).toContain(marker);
    }
  });

  it("keeps generic continuation instructions from becoming privileged approval", () => {
    expect(prTemplate).toContain("Generic “proceed/continue/next task” instructions were not interpreted");
    for (const protectedDecision of [
      "provider selection",
      "paid-plan approval",
      "corpus acquisition/promotion approval",
      "deployment authorization",
      "DNS approval",
      "production approval",
    ]) {
      expect(prTemplate).toContain(protectedDecision);
    }
  });

  it("documents the GitHub admin boundary without falsely claiming protection", () => {
    expect(governance).toContain("GitHub reported `main` as unprotected");
    expect(governance).toContain("the repository had no rulesets");
    expect(governance).toContain("Repository files cannot themselves enable GitHub branch protection or repository rulesets");
    expect(governance).toContain("Do not misrepresent these repository files as branch protection");
    expect(governance).toContain("Require changes to enter through a pull request rather than direct pushes");
    expect(governance).toContain("Require the RamaVerse Quality Gate to pass before merge");
    expect(governance).toContain("Require Code Owner review");
    expect(governance).toContain("Block force-pushes and branch deletion for `main`");
  });

  it("preserves the canonical write sequence and authority boundaries", () => {
    expect(governance).toContain(
      "fresh-check → collision check → narrow branch → implementation → tests → Draft PR → exact-head CI → pre-merge collision check → merge → exact-main post-merge verification",
    );
    expect(governance).toContain("`CURRENT_PROJECT_AUTHORITY.json` is the current operational/release authority");
    expect(governance).toContain("`CONTINUATION_AUTHORITY.json` is the corpus-continuation authority");
    expect(governance).toContain("OLD/LEGACY RamaVerse repositories");
  });
});
