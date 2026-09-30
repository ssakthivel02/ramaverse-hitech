import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "..");
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

describe("RamaVerse current project authority contract", () => {
  it("declares one current operational authority and keeps historical state non-authoritative", () => {
    const authority = JSON.parse(read("CURRENT_PROJECT_AUTHORITY.json"));

    expect(authority.repository).toBe("ssakthivel02/ramaverse-hitech");
    expect(authority.current_state_authority).toBe(true);
    expect(authority.continuation_authority_file).toBe("CONTINUATION_AUTHORITY.json");
    expect(authority.repository_governance_file).toBe("REPOSITORY_GOVERNANCE.md");
    expect(authority.preview_infrastructure_status_file).toBe("PREVIEW_INFRASTRUCTURE_STATUS.json");
    expect(authority.preview_database_compatibility_file).toBe("PREVIEW_DATABASE_COMPATIBILITY.json");
    expect(authority.provider_candidate_selection_runbook).toBe("PROVIDER_CANDIDATE_SELECTION_RUNBOOK.md");
    expect(authority.preview_deployment_executor_registry_file).toBe("PREVIEW_DEPLOYMENT_EXECUTOR_REGISTRY.json");
    expect(authority.preview_deployment_executor_admission_runbook).toBe(
      "PREVIEW_DEPLOYMENT_EXECUTOR_ADMISSION_RUNBOOK.md",
    );
    expect(authority.historical_state_files).toEqual(
      expect.arrayContaining(["PROJECT_STATE.json", "RAMAVERSE_PROJECT_STATE.json"]),
    );
    expect(authority.source_acquisition.allowed).toBe(false);
    expect(authority.canonical_promotion.allowed).toBe(false);
    expect(authority.preview.shared_database_reuse_allowed).toBe(false);
    expect(authority.preview.runtime_ready).toBe(false);
    expect(authority.preview.provider_selection_approved).toBe(false);
    expect(authority.preview.provider_candidate_selection_control).toBe(
      "PROVIDER_CANDIDATE_SELECTION_APPROVED_REQUIRED_BEFORE_LIVE_PROVIDER_PREFLIGHT",
    );
    expect(authority.preview.deployment_executor_admission_control).toBe(
      "PREVIEW_DEPLOYMENT_EXECUTOR_ADMITTED_REQUIRED_BEFORE_PROVIDER_SPECIFIC_PREVIEW_DEPLOYMENT_EXECUTION",
    );
    expect(authority.preview.blocking_requirements).toEqual(
      expect.arrayContaining([
        expect.stringContaining("PROVIDER_CANDIDATE_SELECTION_APPROVED"),
        expect.stringContaining("PREVIEW_DEPLOYMENT_EXECUTOR_ADMITTED"),
        expect.stringContaining("registry defaults to DENY"),
      ]),
    );
    expect(authority.agent_rules).toEqual(
      expect.arrayContaining([
        expect.stringContaining("REPOSITORY_GOVERNANCE.md"),
        expect.stringContaining("live GitHub ruleset enforcement"),
        expect.stringContaining("generic proceed, continue or next-task instructions"),
        expect.stringContaining("Do not reuse a provider-candidate selection artifact"),
        expect.stringContaining("Do not treat PROVIDER_CANDIDATE_SELECTION_APPROVED as provider runtime approval"),
        expect.stringContaining("PREVIEW_DEPLOYMENT_EXECUTOR_ADMITTED"),
        expect.stringContaining("Do not bypass PREVIEW_DEPLOYMENT_EXECUTOR_REGISTRY.json default DENY"),
      ]),
    );
    expect(authority.preview.infrastructure_status).toBe("AWAITING_DEDICATED_PROVIDER_SELECTION_AND_LIVE_VALIDATION");
    expect(authority.production.ready).toBe(false);
  });

  it("binds repository-native controls to the freshly verified live GitHub ruleset", () => {
    const authority = JSON.parse(read("CURRENT_PROJECT_AUTHORITY.json"));
    const governance = read("REPOSITORY_GOVERNANCE.md");
    const codeowners = read(".github/CODEOWNERS");
    const prTemplate = read(".github/pull_request_template.md");

    expect(authority.github_repository_controls.codeowners_file).toBe(".github/CODEOWNERS");
    expect(authority.github_repository_controls.pull_request_template_file).toBe(".github/pull_request_template.md");
    expect(authority.github_repository_controls.main_branch_protected).toBe(true);
    expect(authority.github_repository_controls.active_repository_ruleset).toBe(true);
    expect(authority.github_repository_controls.active_ruleset_name).toBe("Protect main");
    expect(authority.github_repository_controls.active_ruleset_id).toBe(23981067);
    expect(authority.github_repository_controls.required_status_check).toBe("validate");
    expect(authority.github_repository_controls.code_owner_review_required).toBe(true);
    expect(authority.github_repository_controls.review_thread_resolution_required).toBe(true);
    expect(authority.github_repository_controls.stale_reviews_dismissed_on_push).toBe(true);
    expect(authority.github_repository_controls.branch_deletion_blocked).toBe(true);
    expect(authority.github_repository_controls.non_fast_forward_blocked).toBe(true);
    expect(authority.github_repository_controls.bypass_actor_count).toBe(0);
    expect(authority.github_repository_controls.general_approving_review_count).toBe(0);
    expect(authority.github_repository_controls.status).toBe("GITHUB_RULESET_ENFORCEMENT_ACTIVE");
    expect(authority.github_repository_controls.policy).toContain("Repository files do not themselves provide branch protection");
    expect(governance).toContain("Verified GitHub enforcement state");
    expect(governance).toContain("ruleset ID `23981067`");
    expect(governance).toContain("requires status check `validate`");
    expect(codeowners).toContain("@ssakthivel02");
    expect(prTemplate).toContain("## Collision check");
    expect(prTemplate).toContain("Base SHA: `REPLACE_WITH_EXACT_SHA`");
    expect(prTemplate).toContain("Exact-head CI is green before merge");
  });

  it("keeps continuation fail-closed while reconciliation is unresolved", () => {
    const continuation = JSON.parse(read("CONTINUATION_AUTHORITY.json"));

    expect(continuation.status).toBe("CONFLICT_REQUIRES_RECONCILIATION");
    expect(continuation.acquisition_allowed).toBe(false);
    expect(continuation.promotion_allowed).toBe(false);
    expect(continuation.verified_next_source).toBeNull();
  });

  it("records the Aiven free-tier limit while allowing only validated dedicated alternatives", () => {
    const infrastructure = JSON.parse(read("PREVIEW_INFRASTRUCTURE_STATUS.json"));

    expect(infrastructure.status).toBe("AWAITING_DEDICATED_PROVIDER_SELECTION_AND_LIVE_VALIDATION");
    expect(infrastructure.aiven_attempt.requested_service.service_name).toBe("ramaverse-preview-mysql");
    expect(infrastructure.aiven_attempt.requested_service.plan).toBe("free-1-1gb");
    expect(infrastructure.aiven_attempt.requested_service.cloud).toBe("do-blr");
    expect(infrastructure.aiven_attempt.created).toBe(false);
    expect(infrastructure.existing_shared_service.service_name).toBe("hitech-preview-mysql");
    expect(infrastructure.existing_shared_service.allowed_for_ramaverse_preview_runtime).toBe(false);
    expect(infrastructure.provider_portability.runtime_and_schema_setup_provider_neutral).toBe(true);
    expect(infrastructure.provider_portability.candidate_provider_approved).toBe(false);
    expect(infrastructure.provider_portability.live_provider_validation_complete).toBe(false);
    expect(infrastructure.prohibited_shortcuts).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Do not silently reuse hitech-preview-mysql"),
        expect.stringContaining("Do not label a statically compatible provider as approved"),
        expect.stringContaining("Do not create a paid service without explicit owner approval"),
      ]),
    );
  });

  it("keeps human release documentation aligned with the canonical evidence chain", () => {
    const readme = read("README.md");
    const plan = read("PREVIEW_DEPLOYMENT_PLAN.md");

    for (const marker of [
      "PROVIDER_CANDIDATE_SELECTION_APPROVED",
      "LIVE_INTEGRATION_PASS",
      "PREVIEW_ROLLBACK_READY",
      "PREVIEW_DEPLOYMENT_AUTHORIZED",
      "PREVIEW_DEPLOYMENT_HANDOFF_READY",
      "PREVIEW_DEPLOYMENT_EXECUTOR_ADMITTED",
      "PREVIEW_ACCEPTANCE_PASS",
    ]) {
      expect(readme).toContain(marker);
      expect(plan).toContain(marker);
    }

    expect(readme).toContain("Generic instructions such as “proceed” or “continue” do not select a provider");
    expect(plan).toContain("default policy is DENY");
    expect(plan).toContain("Production remains a separate explicit decision and NO-GO");
  });

  it("documents that legacy project-state files cannot start current work", () => {
    const readme = read("README.md");

    expect(readme).toContain("CURRENT_PROJECT_AUTHORITY.json");
    expect(readme).toContain("CONTINUATION_AUTHORITY.json");
    expect(readme).toContain("historical evidence only");
    expect(readme).toContain("must not be used to start acquisition, promotion, deployment, or release work");
    expect(readme).toContain("shared cross-project database service is not an acceptable preview dependency");
  });
});
