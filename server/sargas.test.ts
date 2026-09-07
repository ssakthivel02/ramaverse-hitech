import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createTestContext(): TrpcContext {
  return {
    user: undefined,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

const hasDatabase = Boolean(process.env.DATABASE_URL);
const hasReconciliationEvidence = fs.existsSync(path.resolve(process.cwd(), "RECONCILIATION_DRY_RUN.json"));

describe("RamaVerse edition-aware Sarga registry", () => {
  it.skipIf(!hasDatabase)("returns only a source-identified Sarga record for the verified Bala Kanda entry", async () => {
    const caller = appRouter.createCaller(createTestContext());
    const records = await caller.ramaverse.getSargas({ kandaNumber: 1 });

    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({
      recordKey: "VR-IITK-BALA-001",
      editionId: "IITK_VALMIKI_DIGITAL_TEXT",
      sourceId: "SR-06",
      traditionId: "VALMIKI_RAMAYANA",
      reviewStatus: "source_verified",
    });
  });

  it.skipIf(!hasDatabase)("does not fabricate Sarga rows for Kandas without verified source locators", async () => {
    const caller = appRouter.createCaller(createTestContext());
    const records = await caller.ramaverse.getSargas({ kandaNumber: 2 });
    expect(records).toEqual([]);
  });

  it.skipIf(!hasDatabase)("returns a source-located reader detail without inventing adjacent Sargas", async () => {
    const caller = appRouter.createCaller(createTestContext());
    const detail = await caller.ramaverse.getSargaDetail({ recordKey: "VR-IITK-BALA-001" });

    expect(detail.current).toMatchObject({ recordKey: "VR-IITK-BALA-001", sourceId: "SR-06" });
    expect(detail.previous).toBeNull();
    expect(detail.next).toBeNull();
  });

  it.skipIf(!hasDatabase)("exposes verified Sargas in deterministic local guided search", async () => {
    const caller = appRouter.createCaller(createTestContext());
    const results = await caller.ramaverse.guidedSearch({ query: "Bala" });
    expect(results.sargas).toEqual(expect.arrayContaining([
      expect.objectContaining({ recordKey: "VR-IITK-BALA-001", reviewStatus: "source_verified" }),
    ]));
  });

  it.skipIf(!hasReconciliationEvidence)("exposes a dry-run-only reconciliation state with no staging publication path", async () => {
    const caller = appRouter.createCaller(createTestContext());
    const preview = await caller.ramaverse.getReconciliationPreview();

    expect(preview).toMatchObject({ dryRunOnly: true, historicalCanonicalBaseline: 550, stagingObserved: 28, verifiedAttachedRecords: 28, unavailableClaimedRecords: 50, claimedStagingTotal: 78, stagingPublished: 0, publicationAvailable: false });
    expect(preview.historicalCanonicalBaseline).not.toBe(preview.stagingObserved);
  });

  it("exposes Sargas 25–26 only as quarantined source-readiness evidence", async () => {
    const caller = appRouter.createCaller(createTestContext());
    const preview = await caller.ramaverse.getSourceReadinessPreview();

    expect(preview.evidenceAvailable).toBe(true);
    expect(preview.records).toEqual(expect.arrayContaining([
      expect.objectContaining({ sargaIdentifier: "Ayodhya Kanda 2.25", publicationStatus: "NOT_CANONICAL", readinessStates: ["SOURCE_ACQUIRED", "NEEDS_RECONCILIATION", "NEEDS_TAMIL_REVIEW"] }),
      expect.objectContaining({ sargaIdentifier: "Ayodhya Kanda 2.26", publicationStatus: "NOT_CANONICAL", readinessStates: ["SOURCE_ACQUIRED", "NEEDS_RECONCILIATION", "NEEDS_TAMIL_REVIEW"] }),
    ]));
    expect(preview.records.every((record) => record.recordType === "SOURCE_READINESS_ONLY" && record.publicationStatus !== "CANONICAL")).toBe(true);
    expect(preview.visibilityPolicy).toMatchObject({
      SOURCE_ACQUIRED: { publicReader: false, publicSearch: false, offlineCanonical: false, publicationAction: false },
      STAGING: { publicReader: false, publicSearch: false, offlineCanonical: false, publicationAction: false },
      NEEDS_RECONCILIATION: { publicReader: false, publicSearch: false, offlineCanonical: false, publicationAction: false },
      NEEDS_TAMIL_REVIEW: { publicReader: false, publicSearch: false, offlineCanonical: false, publicationAction: false },
      READY_FOR_EDITORIAL_APPROVAL: { publicReader: false, publicSearch: false, offlineCanonical: false, publicationAction: false },
      CANONICAL: { publicReader: true, publicSearch: true, offlineCanonical: true, publicationAction: false },
    });
  });

  it("never returns primary-staging identifiers through canonical guided search", async () => {
    const caller = appRouter.createCaller(createTestContext());
    const results = await caller.ramaverse.guidedSearch({ query: "stg-v2-ayodhyakanda-s23-event-001" });
    expect(JSON.stringify(results)).not.toContain("stg-v2-");
  });
});
