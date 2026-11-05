import { describe, expect, it } from "vitest";
import { createContext } from "./context";
import { ramaverseRouter } from "../routers/ramaverse";

const privateQueries = [
  "getReconciliationPreview",
  "getSourceReviewPreview",
  "getSourceReadinessPreview",
  "getStagingLedgerPreview",
] as const;

/**
 * Provider-neutral pre-integration contract for Issue #194.
 * No authenticated identity provider is configured in this release.
 * Any future provider adapter must replace this test with an equivalent
 * cryptographically verified-session boundary test, not remove the denial.
 */
function makeRequest(overrides: Record<string, unknown> = {}) {
  return {
    headers: {
      cookie: "ramaverse_session=forged; auth=admin; role=admin",
      authorization: "Bearer forged-owner-token",
      "x-user-role": "admin",
      "x-user-id": "owner",
      "x-forwarded-user": "owner",
    },
    socket: { remoteAddress: "198.51.100.41" },
    user: { id: 1, role: "admin" },
    session: { authenticated: true, role: "admin" },
    ...overrides,
  };
}

async function callerFor(req: Record<string, unknown>) {
  const res = { setHeader() {}, clearCookie() {} };
  const context = await createContext({ req, res } as any);
  return { context, caller: ramaverseRouter.createCaller(context) };
}

describe("unauthenticated editor boundary (no identity provider configured)", () => {
  it("never trusts forged admin headers, cookies or arbitrary request properties", async () => {
    const { context } = await callerFor(makeRequest());
    expect(context.user).toBeNull();
  });

  it.each(privateQueries)("%s refuses a forged owner/admin identity", async route => {
    const { caller } = await callerFor(makeRequest());
    await expect(caller[route]()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it.each(privateQueries)("%s refuses requests missing credentials", async route => {
    const { caller } = await callerFor(makeRequest({ headers: {}, user: undefined, session: undefined }));
    await expect(caller[route]()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("requires a verified context, not a direct client-controlled role", async () => {
    const context = await createContext({
      req: makeRequest({ user: { id: 999, role: "admin" } }),
      res: { setHeader() {} },
    } as any);
    expect(context.user).toBeNull();
    await expect(ramaverseRouter.createCaller(context).getStagingLedgerPreview()).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });
});
