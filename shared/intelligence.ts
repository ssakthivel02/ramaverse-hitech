export type IntelligenceLocale = "en" | "ta" | "hi" | "te" | "kn" | "ml";

export type IntelligenceRecord = {
  recordId: string;
  type: "wisdom" | "character" | "place" | "guidance" | "sarga" | "dialogue" | "dharma" | "devotion";
  title: string;
  excerpt: string;
  kanda?: string | null;
  sarga?: string | null;
  sourceLocator?: string | null;
  confidence: "high" | "medium" | "low";
};

export type GroundingProvenance = {
  corpusLayer: "published_canonical_only";
  stagingExcluded: true;
  recordIds: string[];
  sourceLocators: string[];
  confidence: "high" | "medium" | "low";
};

export type IntelligenceAnswer = {
  answer: string;
  evidence: IntelligenceRecord[];
  relatedQuestions: string[];
  characters: IntelligenceRecord[];
  places: IntelligenceRecord[];
  timeline: IntelligenceRecord[];
  provenance: GroundingProvenance;
  insufficientEvidence: boolean;
  generatedBy: "local-deterministic" | "configured-provider";
};

export type IntelligenceQuery = {
  query: string;
  locale?: IntelligenceLocale;
  kandaNumber?: number;
  limit?: number;
};

export type IntelligenceProvider = {
  name: string;
  answer(input: IntelligenceQuery, evidence: IntelligenceRecord[]): Promise<IntelligenceAnswer>;
};

export const INTELLIGENCE_POLICY = {
  privacy: "No user content leaves the browser or server unless an explicit provider adapter is configured.",
  fallback: "Use canonical database records and deterministic matching when no provider adapter is configured.",
  stagingExcluded: true,
  canonicalBaseline: 550,
} as const;
