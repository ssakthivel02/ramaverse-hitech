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
    expect(authority.preview_infrastructure_status_file).toBe("PREVIEW_INFRASTRUCTURE_STATUS.json");
    expect(authority.historical_state_files).toEqual(
      expect.arrayContaining(["PROJECT_STATE.json", "RAMAVERSE_PROJECT_STATE.json"]),
    );
    expect(authority.source_acquisition.allowed).toBe(false);
    expect(authority.canonical_promotion.allowed).toBe(false);
    expect(authority.preview.shared_database_reuse_allowed).toBe(false);
    expect(authority.preview.runtime_ready).toBe(false);
    expect(authority.preview.infrastructure_status).toBe("BLOCKED_EXTERNAL_PROVIDER_LIMIT");
    expect(authority.production.ready).toBe(false);
  });

  it("keeps continuation fail-closed while reconciliation is unresolved", () => {
    const continuation = JSON.parse(read("CONTINUATION_AUTHORITY.json"));

    expect(continuation.status).toBe("CONFLICT_REQUIRES_RECONCILIATION");
    expect(continuation.acquisition_allowed).toBe(false);
    expect(continuation.promotion_allowed).toBe(false);
    expect(continuation.verified_next_source).toBeNull();
  });

  it("records the external provider limit without weakening preview isolation", () => {
    const infrastructure = JSON.parse(read("PREVIEW_INFRASTRUCTURE_STATUS.json"));

    expect(infrastructure.status).toBe("BLOCKED_EXTERNAL_PROVIDER_LIMIT");
    expect(infrastructure.requested_service.service_name).toBe("ramaverse-preview-mysql");
    expect(infrastructure.requested_service.plan).toBe("free-1-1gb");
    expect(infrastructure.requested_service.cloud).toBe("do-blr");
    expect(infrastructure.provider_result.created).toBe(false);
    expect(infrastructure.existing_shared_service.service_name).toBe("hitech-preview-mysql");
    expect(infrastructure.existing_shared_service.allowed_for_ramaverse_preview_runtime).toBe(false);
    expect(infrastructure.prohibited_shortcuts).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Do not silently reuse hitech-preview-mysql"),
        expect.stringContaining("Do not create a paid service without explicit owner approval"),
      ]),
    );
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
