import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "..");
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

describe("RamaVerse preview deployment handoff contract", () => {
  it("consumes deployment authorization and emits a non-executing sanitized handoff", () => {
    const workflow = read(".github/workflows/preview-deployment-handoff.yml");

    expect(workflow).toContain("RamaVerse Preview Deployment Authorization");
    expect(workflow).toContain("PREVIEW_DEPLOYMENT_AUTHORIZED");
    expect(workflow).toContain("PREVIEW_DEPLOYMENT_HANDOFF_READY");
    expect(workflow).toContain("contains_secret_values: false");
    expect(workflow).toContain("provider_mutation_performed: false");
    expect(workflow).toContain("deployment_performed: false");
    expect(workflow).toContain("database_mutation_performed: false");
    expect(workflow).toContain("production_ready: false");
    expect(workflow).toContain("production_dns_change_allowed: false");
    expect(workflow).toContain("production_deployment_change_allowed: false");
  });

  it("binds handoff metadata to the checked-in preview runtime contract", () => {
    const workflow = read(".github/workflows/preview-deployment-handoff.yml");
    const render = read("render.yaml");

    for (const token of [
      "ramaverse-hitech-preview",
      "ramaverse_preview",
      "/readyz",
      "DATABASE_URL",
      "DATABASE_CA_CERT_B64",
      "JWT_SECRET",
      "OIDC_CLIENT_SECRET",
    ]) {
      expect(workflow).toContain(token);
      expect(render).toContain(token);
    }

    expect(workflow).toContain('release_identity_path: "/releasez"');
    expect(workflow).toContain("auto_deploy_enabled: false");
    expect(render).toContain("autoDeployTrigger: off");
  });

  it("keeps the handoff artifact free of actual secret interpolation", () => {
    const workflow = read(".github/workflows/preview-deployment-handoff.yml");

    expect(workflow).not.toContain("${{ secrets.");
    expect(workflow).not.toContain("provider api token");
    expect(workflow).toContain("Scan handoff for secret-value leakage");
    expect(workflow).toContain("required_secret_names");
  });

  it("registers handoff as a required but non-executing preview boundary", () => {
    const authority = JSON.parse(read("CURRENT_PROJECT_AUTHORITY.json"));

    expect(authority.preview_deployment_handoff_runbook).toBe("PREVIEW_DEPLOYMENT_HANDOFF_RUNBOOK.md");
    expect(authority.preview.deployment_handoff_control).toBe(
      "PREVIEW_DEPLOYMENT_HANDOFF_READY_REQUIRED_BEFORE_PROVIDER_SPECIFIC_PREVIEW_DEPLOYMENT_EXECUTION",
    );
    expect(authority.preview.deployment_execution_implemented).toBe(false);
    expect(authority.production.ready).toBe(false);
    expect(authority.production.dns_change_allowed).toBe(false);
    expect(authority.production.deployment_change_allowed).toBe(false);
  });
});
