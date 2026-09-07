import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { RamaNavbar } from "@/components/RamaNavbar";
import { RamaFooter } from "@/components/RamaFooter";
import { Sparkles, Search, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ReviewStatusBadge } from "@/components/ReviewStatusBadge";
import { useTranslation } from "@/contexts/MultilingualContext";

export default function Wisdom() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const { data: wisdomList, isLoading } = trpc.ramaverse.getWisdom.useQuery({
    search: search.trim() ? search : undefined,
    category: category !== "All" ? category : undefined,
  });

  const categories = ["All", "Dharma", "Leadership", "Devotion"];

  return (
    <div className="min-h-screen flex flex-col bg-[#0b101b] text-[#f3e9d2]">
      <RamaNavbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] text-xs font-semibold mb-4 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            {t("wisdomRecords")} · {t("sourceStatus")}
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold gold-gradient-text mb-4">
            108 {t("wisdomRecords")}
          </h1>
          <p className="text-[#f3e9d2]/70 max-w-2xl mx-auto text-base">
            {t("modulesSubtitle")}
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
                {cat === "All" ? t("allTypes") : cat === "Dharma" ? t("guidance") : cat === "Leadership" ? t("navPrimary") : t("navGuidance")}
              </Button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-[#d4af37]">{t("searching")}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wisdomList?.map((w) => (
              <div key={w.id} className="temple-card rounded-2xl p-6 border border-[#d4af37]/20 flex flex-col justify-between hover:border-[#d4af37]/50 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-[#d4af37] font-semibold uppercase tracking-wider">{t("record")} #{w.recordNumber}</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#1e3a8a]/40 border border-[#3b82f6]/30 text-[#f3e9d2]">
                      {w.category}
                    </span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#f3e9d2] mb-3">{w.title}</h3>
                  {w.shlokaSanskrit && (
                    <div className="bg-[#0b101b] border border-[#d4af37]/20 rounded-xl p-3 mb-4 text-xs font-serif text-[#d4af37] italic">
                      {w.shlokaSanskrit}
                    </div>
                  )}
                  <p className="text-xs text-[#f3e9d2]/80 leading-relaxed mb-4">{w.translation}</p>
                </div>
                <div className="border-t border-white/10 pt-4 mt-2">
                  <p className="text-[11px] text-[#f3e9d2]/60 italic">{t("spiritualNote")} : {w.philosophicalInsight}</p>
                  <span className="block text-[10px] text-[#d4af37] mt-2 font-semibold">{w.sourceReference}</span>
                  <div className="mt-3"><ReviewStatusBadge reviewStatus={w.reviewStatus} /></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <RamaFooter />
    </div>
  );
}
