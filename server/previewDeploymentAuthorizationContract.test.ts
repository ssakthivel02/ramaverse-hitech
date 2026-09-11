import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "..");
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

describe("RamaVerse preview deployment authorization contract", () => {
  it("requires exact release, integration, rollback and owner-approval evidence", () => {
    const workflow = read(".github/workflows/preview-deployment-authorization.yml");

    expect(workflow).toContain("owner_preview_deployment_approval");
    expect(workflow).toContain("deployment_commit");
    expect(workflow).toContain("provider_candidate");
    expect(workflow).toContain("RamaVerse Quality Gate");
    expect(workflow).toContain("RamaVerse Preview Deployment Preflight");
    expect(workflow).toContain("RamaVerse Preview Release Candidate");
    expect(workflow).toContain("RamaVerse Integration Gate");
    expect(workflow).toContain("LIVE_INTEGRATION_PASS");
    expect(workflow).toContain("RamaVerse Preview Rollback Readiness");
    expect(workflow).toContain("PREVIEW_ROLLBACK_READY");
    expect(workflow).toContain('result: "PREVIEW_DEPLOYMENT_AUTHORIZED"');
  });

  it("authorizes preview only and never performs deployment or production mutation", () => {
    const workflow = read(".github/workflows/preview-deployment-authorization.yml");

    expect(workflow).toContain("preview_scope_only: true");
    expect(workflow).toContain("execution_performed: false");
    expect(workflow).toContain("production_ready: false");
    expect(workflow).toContain("production_dns_change_allowed: false");
    expect(workflow).toContain("production_deployment_change_allowed: false");

    const forbiddenExecutionPatterns = [
      /wrangler\s+deploy/i,
      /render\s+deploy/i,
      /kubectl\s+(apply|set|rollout)/i,
      /terraform\s+apply/i,
      /ssh\s+/i,
      /rsync\s+/i,
    ];

    for (const pattern of forbiddenExecutionPatterns) {
      expect(workflow).not.toMatch(pattern);
    }
  });

  it("is watched by deployment preflight and current authority stays fail-closed", () => {
    const preflight = read(".github/workflows/preview-deploy-preflight.yml");
    const authority = JSON.parse(read("CURRENT_PROJECT_AUTHORITY.json"));
    const runbook = read("PREVIEW_DEPLOYMENT_AUTHORIZATION_RUNBOOK.md");

    expect(preflight).toContain('.github/workflows/preview-deployment-authorization.yml');
    expect(preflight).toContain("PREVIEW_DEPLOYMENT_AUTHORIZED");
    expect(preflight).toContain("LIVE_INTEGRATION_PASS");
    expect(preflight).toContain("PREVIEW_ROLLBACK_READY");
    expect(preflight).toContain("execution_performed: false");

    expect(authority.preview.deployment_authorization_control).toBe(
      "PREVIEW_DEPLOYMENT_AUTHORIZED_REQUIRED_BEFORE_ANY_LIVE_PREVIEW_DEPLOYMENT",
    );
    expect(authority.preview.deployment_execution_implemented).toBe(false);
    expect(authority.production.ready).toBe(false);
    expect(authority.production.dns_change_allowed).toBe(false);
    expect(authority.production.deployment_change_allowed).toBe(false);

    expect(runbook).toContain("not a deployment action");
    expect(runbook).toContain("does **not**");
    expect(runbook).toContain("Preview HTTP Smoke");
    expect(runbook).toContain("Preview Acceptance Gate");
  });
});
