import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { RamaNavbar } from "@/components/RamaNavbar";
import { RamaFooter } from "@/components/RamaFooter";
import { BookOpen, ShieldAlert, Users, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ReviewStatusBadge } from "@/components/ReviewStatusBadge";
import { TraditionClassificationBadge } from "@/components/TraditionClassificationBadge";
import { useTranslation } from "@/contexts/MultilingualContext";
import type { IntelligenceLocale, IntelligenceRecord } from "../../../shared/intelligence";
import { CharacterContext, ContextualReaderAssistant, ExplainSimply, ReadAloud } from "@/components/intelligence/IntelligencePanels";

export default function Characters() {
  const { language, t } = useTranslation();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [relationshipFrom, setRelationshipFrom] = useState("none");
  const [relationshipTo, setRelationshipTo] = useState("none");

  const { data: charactersList, isLoading, error } = trpc.ramaverse.getCharacters.useQuery({
    search: search.trim() ? search : undefined,
    category: category !== "All" ? category : undefined,
  });

  const categories = ["All", "Protagonists & Royals", "Key Warriors & Sages", "Supporting Divine Figures"];
  const selectedCharacter = charactersList?.find((character) => character.id === selectedId);
  const intelligenceLocale: IntelligenceLocale = (["en", "ta", "hi", "te", "kn", "ml"] as const).includes(language as IntelligenceLocale) ? language as IntelligenceLocale : "en";
  const selectedCharacterRecord: IntelligenceRecord | undefined = selectedCharacter ? { recordId: `CHR-${selectedCharacter.characterNumber}`, type: "character", title: selectedCharacter.name, excerpt: selectedCharacter.description, confidence: selectedCharacter.reviewStatus === "source_verified" ? "high" : "medium" } : undefined;

  return (
    <div className="min-h-screen flex flex-col bg-[#0b101b] text-[#f3e9d2]">
      <RamaNavbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] text-xs font-semibold mb-4 uppercase tracking-wider">
            <Users className="w-3.5 h-3.5" />
            {t("characters")} · {t("sourceStatus")}
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold gold-gradient-text mb-4">
            51 {t("characters")}
          </h1>
          <p className="text-[#f3e9d2]/70 max-w-2xl mx-auto text-base">
            {t("footerSummary")}
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-12">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-[#d4af37]" />
            <Input
              type="text"
              placeholder={t("searchInput")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-[#162032] border-[#d4af37]/30 text-[#f3e9d2] placeholder:text-[#f3e9d2]/40"
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={category === cat ? "default" : "outline"}
                onClick={() => setCategory(cat)}
                className={`text-xs ${category === cat ? 'bg-[#d4af37] text-[#0b101b] font-bold' : 'border-[#d4af37]/30 text-[#f3e9d2] hover:bg-[#d4af37]/10'}`}
              >
                {cat === "All" ? t("allTypes") : cat === "Protagonists & Royals" ? t("characters") : cat === "Key Warriors & Sages" ? t("sourceLanguage") : t("tradition")}
              </Button>
            ))}
          </div>
        </div>

        {selectedCharacter && <section className="mb-10 rounded-2xl border border-[#d4af37]/30 bg-[#162032]/70 p-6" aria-labelledby="character-evidence-title">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div><p className="text-xs uppercase tracking-[0.16em] text-[#d4af37]">{t("sourceStatus")}</p><h2 id="character-evidence-title" className="mt-1 font-serif text-2xl text-[#f3e9d2]">{selectedCharacter.name}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[#f3e9d2]/70">{t("uiContentSeparate")}</p></div>
            <Button variant="outline" onClick={() => setSelectedId(null)} className="border-[#d4af37]/35 text-[#d4af37]">{t("langClose")}</Button>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-[#0b101b]/45 p-4"><BookOpen className="h-4 w-4 text-[#d4af37]" /><h3 className="mt-2 text-sm font-semibold">{t("kandaSummary")}</h3><p className="mt-1 text-xs text-[#f3e9d2]/65">{Array.isArray(selectedCharacter.appearances) ? selectedCharacter.appearances.join(", ") : t("notPublished")}</p></div>
            <div className="rounded-xl border border-white/10 bg-[#0b101b]/45 p-4"><BookOpen className="h-4 w-4 text-[#d4af37]" /><h3 className="mt-2 text-sm font-semibold">{t("lineageQualities")}</h3><p className="mt-1 text-xs text-[#f3e9d2]/65">{t("lineageQualitiesNote")}</p><div className="mt-3"><TraditionClassificationBadge classification="NOT_PUBLISHED" /></div></div>
            <div className="rounded-xl border border-amber-300/20 bg-amber-300/5 p-4"><ShieldAlert className="h-4 w-4 text-amber-200" /><h3 className="mt-2 text-sm font-semibold">{t("characters")} · {t("tradition")}</h3><p className="mt-1 text-xs text-amber-100/75">{t("withheldPersonEvidence")}</p></div>
            <div className="rounded-xl border border-amber-300/20 bg-amber-300/5 p-4"><ShieldAlert className="h-4 w-4 text-amber-200" /><h3 className="mt-2 text-sm font-semibold">{t("sourceStatus")} · {t("sourceLanguage")}</h3><p className="mt-1 text-xs text-amber-100/75">{t("noAliasList")}</p></div>
            <div className="rounded-xl border border-amber-300/20 bg-amber-300/5 p-4"><ShieldAlert className="h-4 w-4 text-amber-200" /><h3 className="mt-2 text-sm font-semibold">{t("verifiedSargaIndex")} · {t("sacredPlaces")}</h3><p className="mt-1 text-xs text-amber-100/75">{t("noEntityMapping")}</p></div>
            <div className="rounded-xl border border-amber-300/20 bg-amber-300/5 p-4"><ShieldAlert className="h-4 w-4 text-amber-200" /><h3 className="mt-2 text-sm font-semibold">{t("dialogueLinks")}</h3><p className="mt-1 text-xs text-amber-100/75">{t("dialogueNotPublished")}</p></div>
            <div className="rounded-xl border border-white/10 bg-[#0b101b]/45 p-4"><BookOpen className="h-4 w-4 text-[#d4af37]" /><h3 className="mt-2 text-sm font-semibold">{t("editorialReview")}</h3><p className="mt-1 text-xs text-[#f3e9d2]/65">{selectedCharacter.reviewStatus.replaceAll("_", " ")}</p><div className="mt-3"><TraditionClassificationBadge classification="NOT_PUBLISHED" /></div>            </div>
            <div className="mt-6 border-t border-white/10 pt-5"><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs uppercase tracking-[0.16em] text-[#d4af37]">Grounded character context</p>{selectedCharacterRecord && <ReadAloud text={selectedCharacterRecord.excerpt} locale={intelligenceLocale} />}</div><CharacterContext records={selectedCharacterRecord ? [selectedCharacterRecord] : []} locale={intelligenceLocale} /><ContextualReaderAssistant record={selectedCharacterRecord} locale={intelligenceLocale} /><ExplainSimply text={selectedCharacterRecord?.excerpt} locale={intelligenceLocale} /></div>
          </div>
        </section>}

        {!error && <section className="rv-glass mb-10 rounded-2xl p-5" aria-labelledby="relationship-fallback-title">
          <p className="text-xs uppercase tracking-[0.16em] text-[#d4af37]">{t("relationshipDiscovery")}</p>
          <h2 id="relationship-fallback-title" className="mt-1 font-serif text-xl text-[#f3e9d2]">{t("relationshipNavigator")}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#f3e9d2]/70">{t("relationshipAwaitingSelection")}</p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-3" aria-label={t("relationshipStatus")}>
            <li className="rounded-lg border border-amber-300/20 bg-amber-300/5 p-3 text-xs text-amber-100">{t("publishedEdges")}: <strong>0</strong></li>
            <li className="rounded-lg border border-amber-300/20 bg-amber-300/5 p-3 text-xs text-amber-100">{t("fallbackProfile")}</li>
            <li className="rounded-lg border border-amber-300/20 bg-amber-300/5 p-3 text-xs text-amber-100">{t("nextPublication")}</li>
          </ul>
          <div className="mt-5 grid gap-3 rounded-xl border border-white/10 bg-[#070b14]/45 p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <label className="text-xs text-[#f3e9d2]/70">{t("firstProfile")}
              <select aria-label={t("firstProfile")} value={relationshipFrom} onChange={(event) => setRelationshipFrom(event.target.value)} className="mt-1 block w-full rounded-md border border-[#d4af37]/30 bg-[#0b101b] px-3 py-2 text-sm text-[#f3e9d2]"><option value="none">{t("chooseProfile")}</option>{charactersList?.map((character) => <option key={character.id} value={String(character.id)}>{character.name}</option>)}</select>
            </label>
            <label className="text-xs text-[#f3e9d2]/70">{t("secondProfile")}
              <select aria-label={t("secondProfile")} value={relationshipTo} onChange={(event) => setRelationshipTo(event.target.value)} className="mt-1 block w-full rounded-md border border-[#d4af37]/30 bg-[#0b101b] px-3 py-2 text-sm text-[#f3e9d2]"><option value="none">{t("chooseProfile")}</option>{charactersList?.map((character) => <option key={character.id} value={String(character.id)}>{character.name}</option>)}</select>
            </label>
            <Button variant="outline" disabled={relationshipFrom === "none" || relationshipTo === "none"} onClick={() => setSelectedId(Number(relationshipTo))} className="border-[#d4af37]/35 text-[#d4af37]">{t("inspectGap")}</Button>
          </div>
          <p className="mt-3 text-xs text-[#f3e9d2]/65" aria-live="polite">{relationshipFrom !== "none" && relationshipTo !== "none" ? t("noRelationshipEdge") : t("chooseProfile")}</p>
        </section>}

        {error ? (
          <div role="alert" className="text-center py-20 text-rose-200">{t("unexpectedError")}</div>
        ) : isLoading ? (
          <div className="text-center py-20 text-[#d4af37]">{t("loadingCharacters")}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {charactersList?.map((c) => (
              <article key={c.id} className="temple-card rounded-2xl p-6 border border-[#d4af37]/20 flex flex-col justify-between hover:border-[#d4af37]/50 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-[#d4af37] font-semibold uppercase tracking-wider">{t("character")} #{c.characterNumber}</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#1e3a8a]/40 border border-[#3b82f6]/30 text-[#f3e9d2]">
                      {c.roleCategory}
                    </span>
                  </div>
                  <h3 className="font-serif text-xl font-bold text-[#f3e9d2] mb-1">{c.name}</h3>
                  {c.title && <p className="text-xs text-[#d4af37] mb-3 font-serif">{c.title}</p>}
                  <p className="text-xs text-[#f3e9d2]/80 leading-relaxed mb-4">{c.description}</p>
                </div>
                <div className="border-t border-white/10 pt-4 mt-2 flex items-center justify-between text-xs text-[#f3e9d2]/60">
                  <span>{t("appearances")} : {Array.isArray(c.appearances) ? c.appearances.join(", ") : `7 ${t("kandas")}`}</span>
                  <ReviewStatusBadge reviewStatus={c.reviewStatus} />
                </div>
                <Button variant="outline" size="sm" onClick={() => setSelectedId(c.id)} aria-expanded={selectedId === c.id} className="mt-4 self-start border-[#d4af37]/35 text-[#d4af37]">{t("viewEvidence")}</Button>
              </article>
            ))}
          </div>
        )}
      </main>

      <RamaFooter />
    </div>
  );
}
