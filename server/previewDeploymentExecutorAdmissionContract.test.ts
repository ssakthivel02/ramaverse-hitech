import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "..");
const workflow = fs.readFileSync(path.join(root, ".github/workflows/preview-deployment-executor-admission.yml"), "utf8");
const preflight = fs.readFileSync(path.join(root, ".github/workflows/preview-deploy-preflight.yml"), "utf8");
const registry = JSON.parse(fs.readFileSync(path.join(root, "PREVIEW_DEPLOYMENT_EXECUTOR_REGISTRY.json"), "utf8"));
const authority = JSON.parse(fs.readFileSync(path.join(root, "CURRENT_PROJECT_AUTHORITY.json"), "utf8"));
const runbook = fs.readFileSync(path.join(root, "PREVIEW_DEPLOYMENT_EXECUTOR_ADMISSION_RUNBOOK.md"), "utf8");

describe("RamaVerse preview deployment executor admission", () => {
  it("defaults every executor path to fail-closed", () => {
    expect(registry.default_policy).toBe("DENY");
    expect(registry.production_execution_allowed).toBe(false);
    expect(registry.executors.length).toBeGreaterThan(0);
    for (const executor of registry.executors) {
      expect(executor.reviewed).toBe(false);
      expect(executor.enabled).toBe(false);
      expect(executor.workflow).toBeNull();
      expect(executor.executor_status).toBe("NOT_IMPLEMENTED_NOT_APPROVED");
    }
  });

  it("requires exact handoff, commit, provider and separately reviewed executor", () => {
    expect(workflow).toContain("RamaVerse Preview Deployment Handoff");
    expect(workflow).toContain("PREVIEW_DEPLOYMENT_HANDOFF_READY");
    expect(workflow).toContain('test "$commit" = "$GITHUB_SHA"');
    expect(workflow).toContain('executor_status == "REVIEWED_AND_ENABLED"');
    expect(workflow).toContain(".reviewed == true");
    expect(workflow).toContain(".enabled == true");
    expect(workflow).toContain("PREVIEW_DEPLOYMENT_EXECUTOR_ADMITTED");
  });

  it("performs no deployment and never authorizes production", () => {
    expect(workflow).toContain("execution_performed: false");
    expect(workflow).toContain("production_ready: false");
    expect(workflow).toContain("production_dns_change_allowed: false");
    expect(workflow).toContain("production_deployment_change_allowed: false");
    expect(workflow).not.toMatch(/\b(render deploy|wrangler deploy|kubectl apply|helm upgrade|terraform apply)\b/i);
    expect(runbook).toContain("Generic instructions to proceed or continue do not enable an executor");
  });

  it("wires executor admission into canonical authority and deployment preflight", () => {
    expect(authority.preview_deployment_executor_registry_file).toBe("PREVIEW_DEPLOYMENT_EXECUTOR_REGISTRY.json");
    expect(authority.preview_deployment_executor_admission_runbook).toBe(
      "PREVIEW_DEPLOYMENT_EXECUTOR_ADMISSION_RUNBOOK.md",
    );
    expect(authority.preview.deployment_executor_admission_control).toBe(
      "PREVIEW_DEPLOYMENT_EXECUTOR_ADMITTED_REQUIRED_BEFORE_PROVIDER_SPECIFIC_PREVIEW_DEPLOYMENT_EXECUTION",
    );
    expect(preflight).toContain(".github/workflows/preview-deployment-executor-admission.yml");
    expect(preflight).toContain("PREVIEW_DEPLOYMENT_EXECUTOR_REGISTRY.json");
    expect(preflight).toContain("Validate preview executor admission contract");
    expect(preflight).toContain("PREVIEW_DEPLOYMENT_EXECUTOR_ADMITTED");
    expect(preflight).toContain(".default_policy == \"DENY\"");
    expect(preflight).toContain("production_execution_allowed == false");
  });
});
