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

describe("RamaVerse Grounded Retrieval & Anti-Hallucination Tests", () => {
  it("retrieves grounded evidence for Hanuman", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.ramaverse.askGrounded({ query: "Who is Hanuman?", persona: "Student" });

    expect(result).toBeDefined();
    expect(result.answer).toContain("Hanuman");
    expect(result.confidence).toBeDefined();
    expect(result.provenance).toMatchObject({ corpusLayer: "published_canonical_only", stagingExcluded: true });
    expect(JSON.stringify(result)).not.toContain("stg-v2-");
  });

  it("handles unsupported or nonsense questions safely without hallucinating scripture", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.ramaverse.askGrounded({ query: "Quantum mechanics in ancient rocket ships and alien civilization politics", persona: "Scholar" });

    expect(result).toBeDefined();
    expect(result.answer).toContain("specific direct textual matches were not found");
  });

  it("returns quiz and audio results so every indexed content type can be rendered by local search", async () => {
    const caller = appRouter.createCaller(createTestContext());
    const audioResults = await caller.ramaverse.guidedSearch({ query: "Chronicles" });
    const quizResults = await caller.ramaverse.guidedSearch({ query: "Knowledge Challenge" });

    expect(audioResults.audio.length).toBeGreaterThan(0);
    expect(quizResults.quizzes.length).toBeGreaterThan(0);
  });
});
