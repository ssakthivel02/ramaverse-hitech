import React, { useEffect, useState } from "react";
import { ArrowRight, BrainCircuit, ShieldCheck } from "lucide-react";
import { RamaNavbar } from "@/components/RamaNavbar";
import { RamaFooter } from "@/components/RamaFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/contexts/MultilingualContext";
import { trpc } from "@/lib/trpc";
import type { IntelligenceAnswer, IntelligenceLocale } from "../../../shared/intelligence";
import { readCachedAnswer, writeCachedAnswer } from "@/lib/intelligenceCache";
import { AskEvidencePanel, CharacterContext, ContextualReaderAssistant, ExplainForChildren, ExplainInTamil, ExplainSimply, PlaceContext, ReadAloud, RelatedQuestions, SourceComparisonCard, TimelineContext, VoiceInput } from "@/components/intelligence/IntelligencePanels";

type LegacyAnswer = { answer: string; supportingRecords?: string[]; supportingRecordDetails?: Array<{ recordId?: string; label?: string; type?: string; sourceReference?: string | null; reviewStatus?: string }>; provenance?: { corpusLayer: "published_canonical_only"; stagingExcluded: true; sourceReferences?: string[] }; confidence?: string };
const useNoopQuery = () => ({ data: undefined, isFetching: false, isLoading: false, error: null });

function normalizeLegacy(data?: LegacyAnswer): IntelligenceAnswer | undefined {
  if (!data) return undefined;
  const evidence = (data.supportingRecordDetails ?? []).map((item) => ({ recordId: item.recordId ?? item.label ?? "unknown", type: (item.type === "character" ? "character" : "wisdom") as "character" | "wisdom", title: item.label ?? item.recordId ?? "Canonical record", excerpt: item.label ?? "Canonical supporting record", sourceLocator: item.sourceReference ?? null, confidence: item.sourceReference ? "high" as const : "medium" as const }));
  return { answer: data.answer, evidence, relatedQuestions: [], characters: evidence.filter((item) => item.type === "character"), places: [], timeline: [], provenance: { corpusLayer: "published_canonical_only", stagingExcluded: true, recordIds: evidence.map((item) => item.recordId), sourceLocators: evidence.flatMap((item) => item.sourceLocator ? [item.sourceLocator] : []), confidence: evidence.length ? "medium" : "low" }, insufficientEvidence: evidence.length === 0, generatedBy: "local-deterministic" };
}

export default function Intelligence() {
  const { language, t } = useTranslation();
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [requestId, setRequestId] = useState(0);
  const [offlineAnswer, setOfflineAnswer] = useState<IntelligenceAnswer | null>(null);
  const [answerHistory, setAnswerHistory] = useState<IntelligenceAnswer[]>([]);
  const [handledRequestId, setHandledRequestId] = useState(0);
  const intelligenceLocale: IntelligenceLocale = (["en", "ta", "hi", "te", "kn", "ml"] as const).includes(language as IntelligenceLocale) ? language as IntelligenceLocale : "en";
  const modernAvailable = Boolean(trpc.ramaverse.intelligenceAsk?.useQuery);
  const modernAsk = trpc.ramaverse.intelligenceAsk?.useQuery ?? useNoopQuery;
  const legacyAsk = trpc.ramaverse.askGrounded?.useQuery ?? useNoopQuery;
  const modernResult = modernAsk({ query: activeQuery, locale: intelligenceLocale, limit: 8 }, { enabled: modernAvailable && activeQuery.trim().length > 0 && (typeof navigator === "undefined" || navigator.onLine) });
  const legacyResult = legacyAsk({ query: activeQuery, persona: "Scholar", requestId }, { enabled: !modernAvailable && activeQuery.trim().length > 0 });
  useEffect(() => { if (modernResult.data && activeQuery) writeCachedAnswer(activeQuery, modernResult.data as IntelligenceAnswer); }, [activeQuery, modernResult.data]);
  const serverAnswer = modernAvailable ? modernResult.data as IntelligenceAnswer | undefined : normalizeLegacy(legacyResult.data as LegacyAnswer | undefined);
  const answer: IntelligenceAnswer | undefined = offlineAnswer ?? serverAnswer;
  const queryError = modernAvailable ? modernResult.error : legacyResult.error;
  useEffect(() => {
    if (!answer || !activeQuery || requestId === 0 || requestId === handledRequestId) return;
    setAnswerHistory((history) => [...history, answer]);
    setHandledRequestId(requestId);
  }, [activeQuery, answer, handledRequestId, requestId]);
  const submit = (event: React.FormEvent) => { event.preventDefault(); submitQuestion(query); };
  const submitQuestion = (nextQuery: string) => { const trimmed = nextQuery.trim(); if (!trimmed) return; setQuery(trimmed); setOfflineAnswer(typeof navigator !== "undefined" && !navigator.onLine ? readCachedAnswer(trimmed) : null); setRequestId((value) => value + 1); setActiveQuery(trimmed); };

  return <div className="rv-shell min-h-screen bg-[#070b14] text-[#f3e9d2]"><RamaNavbar /><main className="rv-section mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8"><div className="mx-auto max-w-3xl text-center"><div className="inline-flex items-center gap-2 rounded-full border border-[#d7b45a]/25 bg-[#d7b45a]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[.16em] text-[#d7b45a]"><BrainCircuit className="h-4 w-4" />Grounded intelligence</div><h1 className="mt-5 font-serif text-4xl font-bold tracking-tight text-[#f4d98b] sm:text-6xl">Ask with evidence.</h1><p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#f3e9d2]/70 sm:text-base">A provider-neutral intelligence layer for the RamaVerse. It searches the published canonical corpus first, shows its trail, and says when evidence is insufficient.</p><div className="mt-5 flex flex-wrap justify-center gap-2"><Button type="button" variant="outline" className="border-[#d7b45a]/30 text-[#d7b45a]" onClick={() => submitQuestion("Who is Hanuman")}>Who is Hanuman?</Button><Button type="button" variant="outline" className="border-[#d7b45a]/30 text-[#d7b45a]" onClick={() => submitQuestion("What is Ayodhya?")}>What is Ayodhya?</Button></div></div><form onSubmit={submit} className="mx-auto mt-8 flex max-w-3xl gap-2 rounded-2xl border border-[#d7b45a]/20 bg-[#101a2a]/80 p-2 shadow-2xl"><Input aria-label="Ask a grounded question — Ask a grounded RamaVerse question" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ask about Rama, Hanuman, Ayodhya, dharma…" className="h-12 border-0 bg-transparent text-[#f3e9d2] focus-visible:ring-0" /><VoiceInput locale={intelligenceLocale} onTranscript={setQuery} /><Button type="submit" className="h-12 rounded-xl bg-[#d7b45a] px-5 font-semibold text-[#10131c] hover:bg-[#f4d98b]"><span className="hidden sm:inline">Explore</span><ArrowRight className="h-4 w-4 sm:ml-2" /></Button></form><div className="mx-auto mt-3 flex max-w-3xl items-center gap-2 text-xs text-[#f3e9d2]/50"><ShieldCheck className="h-4 w-4 text-emerald-300" />Canonical-only retrieval · no user content sent to an external provider by default{typeof navigator !== "undefined" && !navigator.onLine ? " · Offline cache" : ""}</div>{queryError && activeQuery && <p role="alert" className="mx-auto mt-8 max-w-3xl text-center text-sm text-red-300">{t("unexpectedError")}</p>}{answer && <div className="mx-auto mt-10 max-w-4xl">{answerHistory.slice(0, -1).map((past, index) => <AskEvidencePanel key={`history-${index}-${past.provenance.recordIds.join("-")}`} answer={past.answer} evidence={past.evidence} provenance={past.provenance} locale={intelligenceLocale} />)}<AskEvidencePanel answer={answer.answer} evidence={answer.evidence} provenance={answer.provenance} locale={intelligenceLocale} /><div className="mt-3 flex flex-wrap gap-2"><ReadAloud text={answer.answer} locale={intelligenceLocale} /></div><RelatedQuestions questions={answer.relatedQuestions} locale={intelligenceLocale} onSelect={submitQuestion} />{modernAvailable && <><CharacterContext records={answer.characters} locale={intelligenceLocale} /><PlaceContext records={answer.places} locale={intelligenceLocale} /><TimelineContext records={answer.timeline} locale={intelligenceLocale} /><SourceComparisonCard records={answer.evidence} locale={intelligenceLocale} /><ContextualReaderAssistant record={answer.evidence[0]} locale={intelligenceLocale} /><div className="grid gap-3 md:grid-cols-3"><ExplainSimply text={answer.evidence[0]?.excerpt} locale={intelligenceLocale} /><ExplainForChildren text={null} locale={intelligenceLocale} /><ExplainInTamil text={intelligenceLocale === "ta" ? answer.evidence[0]?.excerpt : null} locale={intelligenceLocale} /></div></>}</div>}{(modernResult.isFetching || legacyResult.isFetching) && <p className="mt-8 text-center text-sm text-[#d7b45a]">Reading the canonical index…</p>}</main><RamaFooter /></div>;
}
