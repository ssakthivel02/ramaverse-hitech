import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "..");
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");
const workflow = read(".github/workflows/provider-readonly-preflight.yml");
const selectionWorkflow = read(".github/workflows/provider-candidate-selection.yml");

describe("RamaVerse provider read-only preflight contract", () => {
  it("requires independent owner-selection evidence before live connectivity", () => {
    expect(selectionWorkflow).toContain("owner_provider_candidate_approval:");
    expect(selectionWorkflow).toContain("PROVIDER_CANDIDATE_SELECTION_APPROVED");
    expect(selectionWorkflow).toContain('selection_scope: "live_preview_candidate_validation_only"');
    expect(selectionWorkflow).toContain("provisioning_performed: false");
    expect(selectionWorkflow).toContain("database_connection_performed: false");
    expect(selectionWorkflow).toContain("database_mutation_performed: false");
    expect(selectionWorkflow).toContain("provider_mutation_performed: false");
    expect(selectionWorkflow).toContain("deployment_performed: false");
    expect(selectionWorkflow).toContain("production_ready: false");
    expect(selectionWorkflow).toContain("production_dns_change_allowed: false");
    expect(selectionWorkflow).toContain("production_deployment_change_allowed: false");
    expect(selectionWorkflow).not.toContain("secrets.");

    expect(workflow).toContain("provider_selection_run_id:");
    expect(workflow).toContain("RamaVerse Provider Candidate Selection");
    expect(workflow).toContain("PROVIDER_CANDIDATE_SELECTION_APPROVED");
    expect(workflow).toContain("provider_selection_evidence_passed: true");
    expect(workflow).not.toMatch(/^\s+owner_provider_candidate_approved:\s*$/m);

    const verificationStep = workflow.indexOf("Verify provider candidate selection run and evidence");
    const identityStep = workflow.indexOf("Require dedicated preview database identity");
    const probeStep = workflow.indexOf("Read-only verified-TLS provider probe");
    expect(verificationStep).toBeGreaterThan(-1);
    expect(identityStep).toBeGreaterThan(verificationStep);
    expect(probeStep).toBeGreaterThan(identityStep);
  });

  it("is manual, fail-closed, isolated, and verified-TLS", () => {
    expect(workflow).toContain("workflow_dispatch:");
    expect(workflow).toContain("provider_candidate:");
    expect(workflow).toContain("RAMAVERSE_TEST_DATABASE_URL");
    expect(workflow).toContain("RAMAVERSE_PREVIEW_DATABASE_HOST");
    expect(workflow).toContain("DATABASE_EXPECTED_NAME: ramaverse_preview");
    expect(workflow).toContain("rejectUnauthorized: true");
    expect(workflow).toContain("minVersion: 'TLSv1.2'");
    expect(workflow).toContain("hitech-preview-mysql");
  });

  it("captures upstream candidate approval, live server, and TLS evidence without schema or data writes", () => {
    expect(workflow).toContain("provider_candidate: process.env.PROVIDER_CANDIDATE");
    expect(workflow).toContain("provider_selection_run_id: process.env.PROVIDER_SELECTION_RUN_ID");
    expect(workflow).toContain("provider_selection_evidence_passed: true");
    expect(workflow).toContain("owner_provider_candidate_approved: true");
    expect(workflow).toContain("SELECT DATABASE() AS db, VERSION() AS server_version, @@version_comment AS version_comment");
    expect(workflow).toContain("SHOW STATUS LIKE 'Ssl%'");
    expect(workflow).toContain("mutation_performed: false");
    expect(workflow).toContain("READ_ONLY_PROVIDER_PREFLIGHT_PASS");

    expect(workflow).not.toMatch(/\bpnpm\s+db:push\b/i);
    expect(workflow).not.toMatch(/\b(?:INSERT|UPDATE|DELETE|REPLACE|CREATE|ALTER|DROP|TRUNCATE)\s+(?:TABLE\s+)?/i);
  });

  it("does not turn candidate selection or a successful connection into provider runtime approval", () => {
    expect(workflow).toContain("It does not approve the provider for preview runtime");
    expect(workflow).not.toContain("provider_selection_approved: true");
    expect(selectionWorkflow).not.toContain("provider_selection_approved: true");
  });
});
