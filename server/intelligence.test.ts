import { describe, expect, it } from "vitest";
import { answerFromEvidence } from "./intelligence";

describe("provider-neutral canonical intelligence", () => {
  it("returns explicit provenance and context for grounded evidence", () => {
    const result = answerFromEvidence({ query: "Hanuman", locale: "en" }, [{
      recordId: "CHR-4",
      type: "character",
      title: "Hanuman",
      excerpt: "A canonical character record.",
      kanda: "Kishkindha Kanda",
      sarga: null,
      sourceLocator: "Valmiki Ramayana Kishkindha Kanda",
      confidence: "high",
    }]);
    expect(result.generatedBy).toBe("local-deterministic");
    expect(result.insufficientEvidence).toBe(false);
    expect(result.provenance).toMatchObject({ corpusLayer: "published_canonical_only", stagingExcluded: true, recordIds: ["CHR-4"] });
    expect(result.characters[0]?.recordId).toBe("CHR-4");
    expect(result.relatedQuestions.length).toBeGreaterThan(0);
  });

  it("does not invent an answer when evidence is absent", () => {
    const result = answerFromEvidence({ query: "unsupported topic", locale: "ta" }, []);
    expect(result.insufficientEvidence).toBe(true);
    expect(result.answer).toMatch(/Insufficient verified evidence/i);
    expect(result.provenance.recordIds).toEqual([]);
    expect(result.provenance.stagingExcluded).toBe(true);
  });
});
