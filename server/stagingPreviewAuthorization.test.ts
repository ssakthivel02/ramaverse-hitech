import { describe, expect, it } from "vitest";
import { ramaverseRouter } from "./routers/ramaverse";

const routes = [
  "getReconciliationPreview",
  "getSourceReviewPreview",
  "getSourceReadinessPreview",
  "getStagingLedgerPreview",
] as const;

describe("staging and reconciliation previews are owner-admin only", () => {
  for (const route of routes) {
    it(`${route} refuses anonymous visitors`, async () => {
      const caller = ramaverseRouter.createCaller({ user: null } as any);
      await expect(caller[route]()).rejects.toMatchObject({ code: "FORBIDDEN" });
    });

    it(`${route} refuses signed-in non-admins`, async () => {
      const caller = ramaverseRouter.createCaller({ user: { role: "user" } } as any);
      await expect(caller[route]()).rejects.toMatchObject({ code: "FORBIDDEN" });
    });
  }
});
