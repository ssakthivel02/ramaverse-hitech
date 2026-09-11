import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "..");
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

describe("RamaVerse repository security contract", () => {
  it("publishes a security policy without encouraging public disclosure of sensitive evidence", () => {
    const policy = read("SECURITY.md");

    expect(policy).toContain("Do not disclose exploit details");
    expect(policy).toContain("do not include reproduction details, secrets, payloads, or sensitive logs");
    expect(policy).toContain("Never commit real credentials");
    expect(policy).toContain("Dependabot pull requests are proposals only");
    expect(policy).toContain("Generic instructions such as “proceed” or “continue” do not authorize");
  });

  it("keeps weekly dependency update proposals enabled for npm and GitHub Actions", () => {
    const config = read(".github/dependabot.yml");

    expect(config).toContain("version: 2");
    expect(config).toContain("package-ecosystem: npm");
    expect(config).toContain("package-ecosystem: github-actions");
    expect(config.match(/interval: weekly/g)?.length).toBe(2);
    expect(config.match(/target-branch: main/g)?.length).toBe(2);
    expect(config).toContain("open-pull-requests-limit: 5");
  });
});
