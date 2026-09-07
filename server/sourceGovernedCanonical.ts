export const CANONICAL_PROVENANCE = {
  corpusLayer: "published_canonical_only",
  stagingExcluded: true,
  publicSearchStaging: 0,
  publicAskStaging: 0,
} as const;

export type CanonicalSargaLike = {
  recordKey: string;
  kandaNumber: number;
  sargaIdentifier: string;
  editorialDescriptor: string;
  summary: string;
  sourceId: string;
  sourceLocator: string;
  traditionId: string;
  reviewStatus: string;
  confidence: string;
};

export type CanonicalDialogueLike = {
  dialogueKey: string;
  speaker: string;
  listener: string;
  context: string;
  paraphrase: string;
  simpleExplanation: string;
  deeperExplanation: string;
  dharmaPrinciple: string;
  sourceLocator: string;
  traditionStatus: string;
  reviewStatus: string;
};

export function toCanonicalNarrativeEvent(record: CanonicalSargaLike) {
  return {
    eventId: `canonical-sarga-context:${record.recordKey}`,
    eventType: "CANONICAL_SARGA_EVENT_CONTEXT" as const,
    kandaNumber: record.kandaNumber,
    sargaIdentifier: record.sargaIdentifier,
    label: record.editorialDescriptor,
    summary: record.summary,
    provenance: {
      ...CANONICAL_PROVENANCE,
      sourceId: record.sourceId,
      sourceLocator: record.sourceLocator,
      traditionClassification: record.traditionId,
      reviewStatus: record.reviewStatus,
      confidence: record.confidence,
    },
  };
}

export function toCanonicalDialogueEvidence(record: CanonicalDialogueLike) {
  return {
    dialogueKey: record.dialogueKey,
    speaker: record.speaker,
    listener: record.listener,
    context: record.context,
    paraphrase: record.paraphrase,
    simpleExplanation: record.simpleExplanation,
    deeperExplanation: record.deeperExplanation,
    dharmaPrinciple: record.dharmaPrinciple,
    provenance: {
      ...CANONICAL_PROVENANCE,
      sourceLocator: record.sourceLocator,
      traditionClassification: record.traditionStatus,
      reviewStatus: record.reviewStatus,
    },
  };
}
