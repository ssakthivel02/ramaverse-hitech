import React, { useMemo, useState } from "react";
import { RamaNavbar } from "@/components/RamaNavbar";
import { RamaFooter } from "@/components/RamaFooter";
import { Database, Link2, Search, ShieldCheck, Sparkles } from "lucide-react";
import { useTranslation } from "@/contexts/MultilingualContext";
import { APPROVED_CORPUS_RECORD_COUNT, APPROVED_CORPUS_VERSION, APPROVED_SOURCE_LINK_COUNT, universeKandaCounts, universeSearch } from "@/lib/knowledgeUniverse";

export default function KnowledgeGraph() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const results = useMemo(() => universeSearch(query), [query]);
  const kandaCounts = useMemo(() => universeKandaCounts(), []);
  const kandaEntries = Object.entries(kandaCounts).filter(([key]) => key !== "unmapped").sort(([a], [b]) => Number(a) - Number(b));

  return (
    <div className="min-h-screen flex flex-col bg-[#0b101b] text-[#f3e9d2]">
      <RamaNavbar />
      <main className="script-safe flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] text-xs font-semibold mb-4 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            {t("knowledgeGraph")} · {t("currentCanonical")}
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold gold-gradient-text mb-4">RamaVerse · {t("knowledgeGraph")}</h1>
          <p className="text-[#f3e9d2]/70 max-w-2xl mx-auto text-base">{t("modulesSubtitle")}</p>
          <p className="mt-3 text-xs text-[#d4af37]/80">{APPROVED_CORPUS_VERSION} · {APPROVED_CORPUS_RECORD_COUNT} governed records · {APPROVED_SOURCE_LINK_COUNT} source registry link</p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]" aria-labelledby="network-title">
          <div className="temple-card rounded-2xl p-6 border border-[#d4af37]/30">
            <div className="flex items-center gap-3 mb-5"><Database className="w-5 h-5 text-[#d4af37]" aria-hidden="true" /><h2 id="network-title" className="font-serif text-2xl font-bold">{t("relationshipNavigator")}</h2></div>
            <p className="text-sm leading-6 text-[#f3e9d2]/70">{t("corpusLegendText")}</p>
            <div className="mt-6 rounded-xl border border-[#d4af37]/20 bg-[#0b101b]/50 p-5" role="img" aria-label={`${APPROVED_SOURCE_LINK_COUNT} source-backed registry connection across ${APPROVED_CORPUS_RECORD_COUNT} approved records`}>
              <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
                <span className="rounded-full border border-[#d4af37]/50 px-4 py-2 text-[#d4af37]">{APPROVED_CORPUS_VERSION}</span>
                <span className="h-px w-10 bg-[#d4af37]/50" aria-hidden="true" />
                <span className="rounded-full border border-[#7aa8d8]/50 px-4 py-2 text-[#b8d5f2]">{APPROVED_SOURCE_LINK_COUNT} source</span>
                <span className="h-px w-10 bg-[#d4af37]/50" aria-hidden="true" />
                <span className="rounded-full border border-[#88b89a]/50 px-4 py-2 text-[#bfe5c8]">{APPROVED_CORPUS_RECORD_COUNT} records</span>
              </div>
              <p className="mt-5 text-center text-xs text-[#f3e9d2]/55">{t("uiContentSeparate")}</p>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3" aria-label="Kanda record distribution">
              {kandaEntries.map(([kanda, count]) => <div key={kanda} className="rounded-xl border border-white/10 bg-white/[0.03] p-3"><div className="text-[10px] uppercase tracking-widest text-[#d4af37]">Kanda {kanda}</div><div className="mt-1 text-xl font-semibold">{count}</div><div className="text-[11px] text-[#f3e9d2]/55">source-backed records</div></div>)}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 rounded-xl border border-[#d4af37]/25 bg-[#162032]/50 px-4 py-3 focus-within:border-[#d4af37]/60">
              <Search className="h-4 w-4 text-[#d4af37]" aria-hidden="true" />
              <label htmlFor="universe-search" className="sr-only">Search approved records</label>
              <input id="universe-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search approved records, locators, or source IDs" className="w-full bg-transparent text-sm text-[#f3e9d2] outline-none placeholder:text-[#f3e9d2]/40" />
            </div>
            <div className="flex items-center justify-between"><h2 className="font-serif text-2xl font-bold text-[#d4af37] flex items-center gap-2"><Link2 className="w-5 h-5" aria-hidden="true" /> {t("currentCanonical")}</h2><span className="text-xs text-[#f3e9d2]/55">{results.length} shown</span></div>
            <div className="space-y-3" aria-live="polite">
              {results.map((record) => <article key={record.id} className="temple-card rounded-xl border border-[#d4af37]/20 p-4"><div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="font-semibold text-[#f3e9d2]">{record.titleEn}</h3>{record.titleTa && <p className="mt-1 text-sm text-[#f3e9d2]/70">{record.titleTa}</p>}</div><span className="rounded-full bg-[#d4af37]/10 px-2 py-1 text-[10px] uppercase tracking-wider text-[#d4af37]">{record.type}</span></div><div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[#f3e9d2]/55"><span>{record.id}</span><span>{record.locator || "Source locator pending"}</span><span>{record.sourceIds.join(", ") || "Source ID pending"}</span></div></article>)}
              {!results.length && <div className="rounded-xl border border-dashed border-[#d4af37]/30 p-8 text-center text-sm text-[#f3e9d2]/60">No approved record matches this search.</div>}
            </div>
          </div>
        </section>

        <div className="mt-12 bg-[#162032]/60 border border-[#d4af37]/20 rounded-2xl p-6 flex items-start gap-4"><ShieldCheck className="w-10 h-10 text-[#d4af37] shrink-0" aria-hidden="true" /><div className="text-xs leading-relaxed"><p className="font-bold text-[#d4af37] mb-1">{t("sourceStatus")}:</p><p>{t("uiContentSeparate")}</p><p className="mt-2 text-[#f3e9d2]/60">Only approved v1.5 records are indexed here. Semantic relationships are not inferred when physical evidence is absent; the list remains the accessible source-of-truth fallback.</p></div></div>
      </main>
      <RamaFooter />
    </div>
  );
}
