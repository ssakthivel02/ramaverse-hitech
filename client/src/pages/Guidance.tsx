import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { RamaNavbar } from "@/components/RamaNavbar";
import { RamaFooter } from "@/components/RamaFooter";
import { HeartHandshake, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ReviewStatusBadge } from "@/components/ReviewStatusBadge";
import { TraditionClassificationBadge } from "@/components/TraditionClassificationBadge";
import { formatTranslation, useTranslation } from "@/contexts/MultilingualContext";

export default function Guidance() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [theme, setTheme] = useState("All");

  const { data: guidanceList, isLoading, error } = trpc.ramaverse.getGuidance.useQuery({
    search: search.trim() ? search : undefined,
    theme: theme !== "All" ? theme : undefined,
  });
  const { data: boundary } = trpc.ramaverse.getGuidanceDevotionBoundary.useQuery();

  const themes = ["All", "Leadership & Duty", "Patience in Adversity", "Devotion & Surrender", "Family Harmony"];

  return (
    <div className="min-h-screen flex flex-col bg-[#0b101b] text-[#f3e9d2]">
      <RamaNavbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] text-xs font-semibold mb-4 uppercase tracking-wider">
            <HeartHandshake className="w-3.5 h-3.5" />
            {t("guidanceRecords")} · {t("spiritualLearning")}
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold gold-gradient-text mb-4">
            100 {t("guidanceRecords")}
          </h1>
          <p className="text-[#f3e9d2]/70 max-w-2xl mx-auto text-base">
            {t("modulesSubtitle")}
          </p>
        </div>

        <section aria-label={t("guidanceBoundaryAria")} className="mb-8 rounded-2xl border border-[#d4af37]/25 bg-[#162032]/65 p-5 text-sm leading-relaxed text-[#f3e9d2]/80">
          <div className="flex flex-wrap items-center gap-3"><TraditionClassificationBadge classification="EDITORIAL_APPLICATION" /><h2 className="font-serif text-lg font-bold text-[#f3e9d2]">{t("guidanceBoundary")}</h2></div>
          <p className="mt-3">{boundary?.guidance.evidenceRule ?? "These entries are editorial life applications linked to their stated Kanda and character references."} {boundary?.devotion.evidenceRule ?? "Traditional devotional practices require a named tradition source, an explicit purpose statement, and a no-outcome-guarantee disclaimer."}</p>
          <p className="mt-2 text-xs text-[#d4af37]">{formatTranslation(t("publishedLayer"), { n: boundary?.devotion.recordCount ?? 0 })}</p>
        </section>

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
            {themes.map((themeOption) => (
              <Button
                key={themeOption}
                variant={theme === themeOption ? "default" : "outline"}
                onClick={() => setTheme(themeOption)}
                className={`text-xs ${theme === themeOption ? 'bg-[#d4af37] text-[#0b101b] font-bold' : 'border-[#d4af37]/30 text-[#f3e9d2] hover:bg-[#d4af37]/10'}`}
              >
                {themeOption === "All" ? t("allTypes") : themeOption === "Leadership & Duty" ? t("navPrimary") : themeOption === "Patience in Adversity" ? t("spiritualNote") : themeOption === "Devotion & Surrender" ? t("navGuidance") : t("characters")}
              </Button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-[#d4af37]">{t("searching")}</div>
        ) : error ? (
          <div role="alert" className="text-center py-20 text-red-200">{t("unexpectedError")}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guidanceList?.map((g) => (
              <div key={g.id} className="temple-card rounded-2xl p-6 border border-[#d4af37]/20 flex flex-col justify-between hover:border-[#d4af37]/50 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-[#d4af37] font-semibold uppercase tracking-wider">{t("guidance")} #{g.recordNumber}</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#1e3a8a]/40 border border-[#3b82f6]/30 text-[#f3e9d2]">
                      {g.theme}
                    </span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#f3e9d2] mb-3">{g.title}</h3>
                  <p className="text-xs text-[#f3e9d2]/80 leading-relaxed mb-4">{g.advice}</p>
                </div>
                  <div className="border-t border-white/10 pt-4 mt-2 flex items-center justify-between text-[11px] text-[#f3e9d2]/60">
                    <span>{t("kanda")} : {g.kandaReference}</span>
                    <span className="text-[#d4af37] font-medium">{g.characterReference}</span>
                    <ReviewStatusBadge reviewStatus={g.reviewStatus} />
                  </div>
                  <div className="mt-3"><TraditionClassificationBadge classification="EDITORIAL_APPLICATION" /></div>
                </div>
            ))}
          </div>
        )}
      </main>

      <RamaFooter />
    </div>
  );
}
