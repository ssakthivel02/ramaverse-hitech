import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { RamaNavbar } from "@/components/RamaNavbar";
import { RamaFooter } from "@/components/RamaFooter";
import { MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ReviewStatusBadge } from "@/components/ReviewStatusBadge";
import { useTranslation } from "@/contexts/MultilingualContext";
import type { IntelligenceLocale, IntelligenceRecord } from "../../../shared/intelligence";
import { ContextualReaderAssistant, ExplainSimply, PlaceContext, ReadAloud } from "@/components/intelligence/IntelligencePanels";

export default function Places() {
  const { language, t } = useTranslation();
  const [search, setSearch] = useState("");
  const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(null);

  const { data: placesList, isLoading } = trpc.ramaverse.getPlaces.useQuery({
    search: search.trim() ? search : undefined,
  });
  const selectedPlace = placesList?.find((place) => place.id === selectedPlaceId);
  const intelligenceLocale: IntelligenceLocale = (["en", "ta", "hi", "te", "kn", "ml"] as const).includes(language as IntelligenceLocale) ? language as IntelligenceLocale : "en";
  const selectedPlaceRecord: IntelligenceRecord | undefined = selectedPlace ? { recordId: `PLC-${selectedPlace.placeNumber}`, type: "place", title: selectedPlace.name, excerpt: selectedPlace.significance, kanda: Array.isArray(selectedPlace.associatedKandas) ? selectedPlace.associatedKandas.join(", ") : null, sourceLocator: null, confidence: selectedPlace.reviewStatus === "source_verified" ? "high" : "medium" } : undefined;

  return (
    <div className="min-h-screen flex flex-col bg-[#0b101b] text-[#f3e9d2]">
      <RamaNavbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] text-xs font-semibold mb-4 uppercase tracking-wider">
            <MapPin className="w-3.5 h-3.5" />
            {t("sacredPlaces")} · {t("sourceStatus")}
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold gold-gradient-text mb-4">
            25 {t("sacredPlaces")}
          </h1>
          <p className="text-[#f3e9d2]/70 max-w-2xl mx-auto text-base">
            {t("footerSummary")}
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-[#d4af37]" />
            <Input
              type="text"
              placeholder={t("searchInput")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-[#162032] border-[#d4af37]/30 text-[#f3e9d2] placeholder:text-[#f3e9d2]/40"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-[#d4af37]">{t("searching")}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {placesList?.map((p) => (
              <div key={p.id} className="temple-card rounded-2xl p-6 border border-[#d4af37]/20 flex flex-col justify-between hover:border-[#d4af37]/50 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-[#d4af37] font-semibold uppercase tracking-wider">{t("location")} #{p.placeNumber}</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#1e3a8a]/40 border border-[#3b82f6]/30 text-[#f3e9d2]">
                      {p.modernLocation || t("sourceLanguage")}
                    </span>
                  </div>
                  <h3 className="font-serif text-xl font-bold text-[#f3e9d2] mb-3">{p.name}</h3>
                  <p className="text-xs text-[#f3e9d2]/80 leading-relaxed mb-4">{p.significance}</p>
                  <button type="button" onClick={() => setSelectedPlaceId(p.id)} aria-expanded={selectedPlaceId === p.id} className="text-xs font-semibold text-[#d4af37] hover:text-[#f4d98b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]">{t("viewEvidence")}</button>
                </div>
                <div className="border-t border-white/10 pt-4 mt-2 flex items-center justify-between text-[11px] text-[#f3e9d2]/60">
                  <span>{t("kanda")} : {Array.isArray(p.associatedKandas) ? p.associatedKandas.join(", ") : t("kandas")}</span>
                  <ReviewStatusBadge reviewStatus={p.reviewStatus} />
                </div>
              </div>
            ))}
          </div>
        )}
        {selectedPlaceRecord && <section className="rv-glass mt-10 rounded-2xl border border-[#d7b45a]/20 p-5" aria-labelledby="place-intelligence-title"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 id="place-intelligence-title" className="font-serif text-xl text-[#d7b45a]">Grounded place context</h2><p className="mt-1 text-xs text-[#f3e9d2]/60">Narrative sequence is shown where authoritative coordinates are not present.</p></div><ReadAloud text={selectedPlaceRecord.excerpt} locale={intelligenceLocale} /></div><PlaceContext records={[selectedPlaceRecord]} locale={intelligenceLocale} /><ContextualReaderAssistant record={selectedPlaceRecord} locale={intelligenceLocale} /><ExplainSimply text={selectedPlaceRecord.excerpt} locale={intelligenceLocale} /></section>}
      </main>

      <RamaFooter />
    </div>
  );
}
