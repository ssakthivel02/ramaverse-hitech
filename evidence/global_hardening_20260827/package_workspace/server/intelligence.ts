import { and, eq, sql } from "drizzle-orm";
import { getDb } from "./db";
import { characters, places, wisdomRecords, guidanceRecords, sargas } from "../drizzle/schema";
import type { GroundingProvenance, IntelligenceAnswer, IntelligenceLocale, IntelligenceQuery, IntelligenceRecord } from "../shared/intelligence";

const STOP_WORDS = new Set(["the", "and", "for", "with", "what", "who", "where", "how", "are", "is", "of", "in", "to", "a", "an", "on", "யார்", "என்ன", "மற்றும்"]);

function tokens(value: string) {
  return value.toLocaleLowerCase().split(/\s+/).map((token) => token.replace(/^[^\w]+|[^\w]+$/g, "")).filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

function score(query: string, haystack: string) {
  const q = tokens(query);
  const h = haystack.toLocaleLowerCase();
  return q.reduce((total, token) => total + (h.includes(token) ? 1 : 0), 0);
}

function provenance(evidence: IntelligenceRecord[]): GroundingProvenance {
  const locators = evidence.map((item) => item.sourceLocator).filter((value): value is string => Boolean(value));
  return {
    corpusLayer: "published_canonical_only",
    stagingExcluded: true,
    recordIds: evidence.map((item) => item.recordId),
    sourceLocators: locators,
    confidence: evidence.length > 0 && locators.length === evidence.length ? "high" : evidence.length > 0 ? "medium" : "low",
  };
}

function relatedQuestions(evidence: IntelligenceRecord[], locale: IntelligenceLocale = "en") {
  const hasCharacter = evidence.some((item) => item.type === "character");
  const hasPlace = evidence.some((item) => item.type === "place");
  const questions = locale === "ta"
    ? ["இந்தப் பதிவின் ஆதாரம் என்ன?", "இந்த நிகழ்வு எந்த காண்டத்தில் இடம்பெறுகிறது?"]
    : ["What is the source locator for this record?", "Which Kanda and Sarga give this context?"];
  if (hasCharacter) questions.push(locale === "ta" ? "இந்தக் கதாபாத்திரத்துடன் தொடர்புடைய பதிவுகள் எவை?" : "Which places and events connect to this character?");
  if (hasPlace) questions.push(locale === "ta" ? "இந்தத் தலத்தின் ராமாயணச் சூழல் என்ன?" : "What narrative context is attached to this place?");
  return questions.slice(0, 4);
}

export async function searchCanonicalIntelligence(input: IntelligenceQuery): Promise<IntelligenceRecord[]> {
  const db = await getDb();
  if (!db || !input.query.trim()) return [];
  const [w, c, p, g, s] = await Promise.all([
    db.select().from(wisdomRecords),
    db.select().from(characters),
    db.select().from(places),
    db.select().from(guidanceRecords),
    db.select().from(sargas),
  ]);
  const records: IntelligenceRecord[] = [
    ...w.map((row) => ({ recordId: `WIS-${row.recordNumber}`, type: "wisdom" as const, title: row.title, excerpt: row.translation, kanda: row.kandaId ? `Kanda ${row.kandaId}` : null, sarga: null, sourceLocator: row.sourceReference, confidence: row.sourceReference ? "high" as const : "medium" as const })),
    ...c.map((row) => ({ recordId: `CHR-${row.characterNumber}`, type: "character" as const, title: row.name, excerpt: row.description, kanda: null, sarga: null, sourceLocator: null, confidence: "medium" as const })),
    ...p.map((row) => ({ recordId: `PLC-${row.placeNumber}`, type: "place" as const, title: row.name, excerpt: row.significance, kanda: Array.isArray(row.associatedKandas) ? row.associatedKandas[0] ?? null : null, sarga: null, sourceLocator: null, confidence: "medium" as const })),
    ...g.map((row) => ({ recordId: `GDN-${row.recordNumber}`, type: "guidance" as const, title: row.title, excerpt: row.advice, kanda: row.kandaReference, sarga: null, sourceLocator: null, confidence: "medium" as const })),
    ...s.map((row) => ({ recordId: row.recordKey, type: "sarga" as const, title: row.editorialDescriptor, excerpt: row.summary, kanda: `Kanda ${row.kandaNumber}`, sarga: row.sargaIdentifier, sourceLocator: row.sourceLocator, confidence: row.confidence === "source_verified" ? "high" as const : "medium" as const })),
  ];
  return records.map((record) => ({ record, rank: score(input.query, `${record.title} ${record.excerpt} ${record.kanda ?? ""} ${record.sarga ?? ""}`) }))
    .filter((item) => item.rank > 0)
    .sort((a, b) => b.rank - a.rank || a.record.recordId.localeCompare(b.record.recordId))
    .slice(0, input.limit ?? 8)
    .map((item) => item.record);
}

export function answerFromEvidence(input: IntelligenceQuery, evidence: IntelligenceRecord[]): IntelligenceAnswer {
  const base = provenance(evidence);
  if (evidence.length === 0) {
    return {
      answer: "Insufficient verified evidence in the published canonical corpus to answer this question reliably.",
      evidence: [],
      relatedQuestions: relatedQuestions([], input.locale),
      characters: [],
      places: [],
      timeline: [],
      provenance: base,
      insufficientEvidence: true,
      generatedBy: "local-deterministic",
    };
  }
  const lead = evidence[0];
  const answer = `The canonical corpus connects this question to ${lead.title}. ${lead.excerpt}`;
  return {
    answer,
    evidence,
    relatedQuestions: relatedQuestions(evidence, input.locale),
    characters: evidence.filter((item) => item.type === "character"),
    places: evidence.filter((item) => item.type === "place"),
    timeline: evidence.filter((item) => item.type === "sarga"),
    provenance: base,
    insufficientEvidence: false,
    generatedBy: "local-deterministic",
  };
}

export async function answerCanonicalQuestion(input: IntelligenceQuery): Promise<IntelligenceAnswer> {
  return answerFromEvidence(input, await searchCanonicalIntelligence(input));
}

export function getConfiguredProviderName() {
  return process.env.RAMAVERSE_INTELLIGENCE_PROVIDER?.trim() || null;
}
