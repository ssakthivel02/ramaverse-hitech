import React from "react";
import { Link } from "wouter";
import { Sparkles, Heart } from "lucide-react";
import { TraditionClassificationBadge } from "@/components/TraditionClassificationBadge";
import { formatTranslation, localizedPath, useTranslation } from "@/contexts/MultilingualContext";

export function RamaFooter() {
  const { language, t } = useTranslation();
  return (
    <footer className="rv-footer border-t border-[#d4af37]/20 bg-[#070b14] pt-16 pb-12 text-[#f3e9d2]/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="rv-brand-mark flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#f4d98b] via-[#d7b45a] to-[#b45309] text-lg font-bold text-[#070b14]">
                ॐ
              </div>
              <span className="font-serif text-xl font-bold tracking-wider gold-gradient-text">RAMAVERSE</span>
            </div>
            <p className="text-xs leading-relaxed">
              {t("footerSummary")}
            </p>
          </div>

          <div>
            <h4 className="font-serif text-[#d4af37] font-semibold text-sm mb-4 uppercase tracking-wider">{t("canonicalExplore")}</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href={localizedPath(language, "/kandas")} className="hover:text-[#d4af37] transition-colors">{t("footerKandas")}</Link></li>
              <li><Link href={localizedPath(language, "/wisdom")} className="hover:text-[#d4af37] transition-colors">{t("footerWisdom")}</Link></li>
              <li><Link href={localizedPath(language, "/characters")} className="hover:text-[#d4af37] transition-colors">{t("footerCharacters")}</Link></li>
              <li><Link href={localizedPath(language, "/places")} className="hover:text-[#d4af37] transition-colors">{t("footerPlaces")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-[#d4af37] font-semibold text-sm mb-4 uppercase tracking-wider">{t("spiritualLearning")}</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href={localizedPath(language, "/guidance")} className="hover:text-[#d4af37] transition-colors">{t("footerGuidance")}</Link></li>
              <li><Link href={localizedPath(language, "/stories")} className="hover:text-[#d4af37] transition-colors">{t("footerStories")}</Link></li>
              <li><Link href={localizedPath(language, "/quizzes")} className="hover:text-[#d4af37] transition-colors">{t("footerQuizzes")}</Link></li>
              <li><Link href={localizedPath(language, "/audio")} className="hover:text-[#d4af37] transition-colors">{t("footerAudio")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-[#d4af37] font-semibold text-sm mb-4 uppercase tracking-wider">{t("sacredPlatform")}</h4>
            <p className="text-xs leading-relaxed mb-4">{t("platformFidelity")}</p>
            <div className="flex items-center gap-2 text-xs text-[#d4af37]">
              <Sparkles className="w-4 h-4" />
              <span>{t("footerThemes")}</span>
            </div>
          </div>
        </div>

        <section aria-label={t("corpusLegend")} className="rv-glass mb-8 rounded-xl p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#d4af37]">{t("corpusLegend")}</p>
          <p className="mt-2 text-xs leading-relaxed text-[#f3e9d2]/65">{t("corpusLegendText")}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <TraditionClassificationBadge classification="VERIFIED_CANONICAL" />
            <TraditionClassificationBadge classification="SOURCE_ACQUIRED" />
            <TraditionClassificationBadge classification="TRADITIONAL" />
            <TraditionClassificationBadge classification="LATER_TEXT" />
            <TraditionClassificationBadge classification="REGIONAL" />
          </div>
        </section>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs">
          <p>{formatTranslation(t("footerCopyright"), { year: new Date().getFullYear() })}</p>
          <p className="flex items-center gap-1 mt-2 sm:mt-0">
            {t("craftedWith")} <Heart className="w-3 h-3 text-red-500 fill-red-500" /> {t("forHeritage")}
          </p>
        </div>
      </div>
    </footer>
  );
}
