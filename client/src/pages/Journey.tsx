import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { RamaNavbar } from "@/components/RamaNavbar";
import { RamaFooter } from "@/components/RamaFooter";
import { Compass, MapPin, ArrowRight } from "lucide-react";
import { useTranslation } from "@/contexts/MultilingualContext";

export default function Journey() {
  const { t } = useTranslation();
  const { data: places, isLoading, error } = trpc.ramaverse.getPlaces.useQuery();
  const [selectedPlace, setSelectedPlace] = useState<number>(0);

  const activePlace = places?.[selectedPlace] || places?.[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#0b101b] text-[#f3e9d2]">
      <RamaNavbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] text-xs font-semibold mb-4 uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" />
            {t("sacredPlaces")} · {t("navJourney")}
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold gold-gradient-text mb-4">
            {t("navRamaLife")} · {t("navJourney")}
          </h1>
          <p className="text-[#f3e9d2]/70 max-w-2xl mx-auto text-base">
            {t("footerSummary")}
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-[#d4af37]">{t("searching")}</div>
        ) : error ? (
          <div role="alert" className="text-center py-20 text-red-300">{t("unexpectedError")}</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Timeline Milestones list */}
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {places?.map((p, idx) => (
                <div
                  key={p.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedPlace(idx)}
                  onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setSelectedPlace(idx); } }}
                  className={`temple-card rounded-xl p-4 cursor-pointer transition-all border flex items-center justify-between ${selectedPlace === idx ? 'border-[#d4af37] bg-[#162032]' : 'border-[#d4af37]/20 hover:border-[#d4af37]/50'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37] font-bold text-xs">
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className="font-serif text-sm font-bold text-[#f3e9d2]">{p.name}</h3>
                      <p className="text-[11px] text-[#f3e9d2]/60">{p.modernLocation}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#d4af37]" />
                </div>
              ))}
            </div>

            {/* Active Milestone Detail */}
            {activePlace && (
              <div className="lg:col-span-2 temple-card rounded-2xl p-8 border border-[#d4af37]/40 space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-6">
                  <div>
                    <span className="text-xs text-[#d4af37] uppercase tracking-widest font-semibold">{t("milestone")} #{selectedPlace + 1}</span>
                    <h2 className="font-serif text-3xl font-bold gold-gradient-text mt-1">{activePlace.name}</h2>
                    <p className="text-xs text-[#f3e9d2]/70 mt-1">{t("sourceStatus")} : {activePlace.modernLocation}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs px-3 py-1 rounded-full bg-[#1e3a8a]/40 text-[#f3e9d2] border border-[#3b82f6]/30">
                      {t("tradition")}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-serif text-lg font-semibold text-[#d4af37] mb-3">{t("sacredPlaces")}</h4>
                  <p className="text-sm text-[#f3e9d2]/80 leading-relaxed">{activePlace.significance}</p>
                </div>

                <div className="bg-[#0b101b] border border-[#d4af37]/20 rounded-xl p-4 text-xs text-[#f3e9d2]/80 space-y-2">
                  <p className="font-semibold text-[#d4af37]">{t("corpusLegend")} :</p>
                  <p>{t("corpusLegendText")}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <RamaFooter />
    </div>
  );
}
