import { describe, expect, it } from "vitest";
import { toCanonicalDialogueEvidence, toCanonicalNarrativeEvent } from "./sourceGovernedCanonical";

describe("source-governed canonical helpers", () => {
  it("maps a canonical Sarga context to a source-labelled narrative event without staging exposure", () => {
    const event = toCanonicalNarrativeEvent({ recordKey: "AYO-001", kandaNumber: 2, sargaIdentifier: "Ayodhya 1", editorialDescriptor: "A canonical opening", summary: "A bounded summary.", sourceId: "src-1", sourceLocator: "Ayodhya 1.1", traditionId: "VERIFIED_CANONICAL", reviewStatus: "human_reviewed", confidence: "source_verified" });
    expect(event.eventType).toBe("CANONICAL_SARGA_EVENT_CONTEXT");
    expect(event.provenance).toMatchObject({ corpusLayer: "published_canonical_only", stagingExcluded: true, sourceLocator: "Ayodhya 1.1", traditionClassification: "VERIFIED_CANONICAL" });
  });

  it("preserves dialogue source, tradition, and review state while excluding staging", () => {
    const dialogue = toCanonicalDialogueEvidence({ dialogueKey: "DIA-001", speaker: "Rama", listener: "Sita", context: "A canonical dialogue", paraphrase: "A bounded paraphrase.", simpleExplanation: "A clear explanation.", deeperExplanation: "A deeper explanation.", dharmaPrinciple: "Dharma", sourceLocator: "Ayodhya 1.2", traditionStatus: "VERIFIED_CANONICAL", reviewStatus: "human_reviewed" });
    expect(dialogue.provenance).toMatchObject({ corpusLayer: "published_canonical_only", stagingExcluded: true, sourceLocator: "Ayodhya 1.2", traditionClassification: "VERIFIED_CANONICAL" });
  });
});
