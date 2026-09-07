import { trpc } from "@/lib/trpc";
import { RamaNavbar } from "@/components/RamaNavbar";
import { KandaAtmosphere } from "@/components/KandaAtmosphere";
import { RamaFooter } from "@/components/RamaFooter";
import { BookOpen, Sparkles, ArrowRight } from "lucide-react";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { formatTranslation, getLocalizedKandaLabel, localizedPath, useTranslation } from "@/contexts/MultilingualContext";

type SourceReadinessRecord = {
  recordKey: string;
  kandaNumber: number;
  sargaIdentifier: string;
  englishEditorialDescriptor: string;
  readinessStates: string[];
  sourceLocator: string;
};

export default function Kandas() {
  const { language, t } = useTranslation();
  const { data: kandas, isLoading } = trpc.ramaverse.getKandas.useQuery();
  const { data: sargas } = trpc.ramaverse.getSargas.useQuery();
  const { data: sourceReview } = trpc.ramaverse.getSourceReviewPreview.useQuery();
  const { data: sourceReadiness } = trpc.ramaverse.getSourceReadinessPreview.useQuery();
  const { data: stagingLedger } = trpc.ramaverse.getStagingLedgerPreview.useQuery();
  const [selectedKanda, setSelectedKanda] = useState<number | null>(null);
  const sourceReadinessRecords = (sourceReadiness?.records ?? []) as SourceReadinessRecord[];

  const activeKanda = kandas?.find(k => k.kandaNumber === selectedKanda) || kandas?.[0];
  const visibleSargas = sargas?.filter((sarga) => sarga.kandaNumber === activeKanda?.kandaNumber) ?? [];
  const coverageState = (kandaNumber: number) => {
    const verified = sargas?.filter((sarga) => sarga.kandaNumber === kandaNumber).length ?? 0;
    const sourceAcquired = sourceReadinessRecords.filter((record) => record.kandaNumber === kandaNumber).length;
    return verified > 0
      ? { label: t("verifiedState"), detail: t("sourceLocatedRelease"), tone: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300" }
      : sourceAcquired > 0
        ? { label: t("sourceAcquiredState"), detail: t("sourceAcquiredReview"), tone: "border-sky-300/30 bg-sky-300/10 text-sky-100" }
      : { label: t("notAcquiredState"), detail: t("notPublished"), tone: "border-amber-300/30 bg-amber-300/10 text-amber-100" };
  };
  const coverageLabel = (kandaNumber: number, total: number) => {
    const verified = sargas?.filter((sarga) => sarga.kandaNumber === kandaNumber).length ?? 0;
    const sourceAcquired = sourceReadinessRecords.filter((record) => record.kandaNumber === kandaNumber).length;
    return sourceAcquired ? `${verified}/${total} · ${sourceAcquired} ${t("sourceAcquiredState")}` : `${verified}/${total} ${t("verifiedState")}`;
  };
  const activeSourceReview = sourceReview?.evidenceAvailable && sourceReview.kandaNumber === activeKanda?.kandaNumber ? sourceReview : null;
  const activeReadiness = sourceReadiness?.evidenceAvailable ? sourceReadinessRecords.filter((record) => record.kandaNumber === activeKanda?.kandaNumber) : [];

  return (
    <div className="rv-shell min-h-screen flex flex-col bg-[#070b14] text-[#f3e9d2]">
      <RamaNavbar />

      <main className="rv-section flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] text-xs font-semibold mb-4 uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5" />
            {t("booksOfRamayana")}
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold gold-gradient-text mb-4">
            {t("kandaExplorer")}
          </h1>
          <p className="text-[#f3e9d2]/70 max-w-2xl mx-auto text-base">
            {t("kandaIntro")}
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-[#d4af37]">{t("loadingKandas")}</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Kandas List */}
            <div className="space-y-4">
              {kandas?.map((kanda) => {
                const isSelected = (selectedKanda === null && kanda.kandaNumber === 1) || selectedKanda === kanda.kandaNumber;
                const state = coverageState(kanda.kandaNumber);
                return (
                  <button
                    type="button"
                    key={kanda.id}
                    onClick={() => setSelectedKanda(kanda.kandaNumber)}
                    aria-pressed={isSelected}
                    className={`rv-glass temple-card w-full rounded-xl p-5 text-left cursor-pointer transition-all border ${isSelected ? 'border-[#d4af37] bg-[#162032]/90' : 'border-[#d4af37]/20 hover:border-[#d4af37]/50'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs text-[#d4af37] font-semibold uppercase tracking-wider">{getLocalizedKandaLabel(language, kanda.kandaNumber)}</span>
                        <p className="text-xs text-[#f3e9d2]/60 font-serif">{kanda.sanskritName}</p>
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded-full bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30" aria-label={`${getLocalizedKandaLabel(language, kanda.kandaNumber)} ${t("sourceLocated")} Sarga coverage`}>
                        {coverageLabel(kanda.kandaNumber, kanda.sargasCount)}
                      </span>
                    </div>
                    <p className={`mt-3 inline-flex rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${state.tone}`} title={state.detail}>{state.label}</p>
                  </button>
                );
              })}
            </div>

            {/* Kanda Detail View */}
            {activeKanda && (
              <div className="lg:col-span-2 temple-card relative overflow-hidden rounded-2xl p-8 border border-[#d4af37]/40 space-y-6">
                <KandaAtmosphere kandaNumber={activeKanda.kandaNumber} />
                <div className="flex items-center justify-between border-b border-white/10 pb-6">
                  <div>
                    <span className="text-xs text-[#d4af37] uppercase tracking-widest font-semibold">{formatTranslation(t("bookOf"), { n: activeKanda.kandaNumber })}</span>
                    <h2 className="font-serif text-3xl font-bold gold-gradient-text mt-1">{activeKanda.name}</h2>
                    <p className="text-sm font-serif text-[#d4af37]/80">{activeKanda.sanskritName}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-[#f3e9d2]">{t("editionAwareIndex")}</span>
                    <span className="mt-2 block text-[11px] uppercase tracking-wide text-amber-300">{t("editorialReview")}: {activeKanda.reviewStatus.replaceAll("_", " ")}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-serif text-lg font-semibold text-[#d4af37] mb-3">{t("kandaSummary")}</h4>
                  <p className="text-sm text-[#f3e9d2]/80 leading-relaxed">{activeKanda.summary}</p>
                </div>

                <div>
                  <h4 className="font-serif text-lg font-semibold text-[#d4af37] mb-3">{t("corpusMilestones")}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {Array.isArray(activeKanda.keyEvents) && (activeKanda.keyEvents as string[]).map((event, idx) => (
                      <div key={idx} className="bg-[#0b101b]/80 border border-[#d4af37]/20 rounded-xl p-4 text-xs text-[#f3e9d2]/90">
                        <span className="block font-semibold text-[#d4af37] mb-1">{t("milestone")} {idx + 1}</span>
                        {event}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-white/10 pt-6">
                  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-4">
                    <div>
                      <h4 className="font-serif text-lg font-semibold text-[#d4af37]">{t("verifiedSargaIndex")}</h4>
                      <p className="text-xs text-[#f3e9d2]/60 mt-1">{t("editionOnly")}</p>
                    </div>
                    <span className="text-[11px] uppercase tracking-wide text-[#d4af37]">{visibleSargas.length}/{activeKanda.sargasCount} {t("sourceLocatedRelease")}</span>
                  </div>
                  {visibleSargas.length > 0 ? (
                    <div className="space-y-3">
                      {visibleSargas.map((sarga) => (
                        <article key={sarga.recordKey} className="rounded-xl border border-[#d4af37]/20 bg-[#0b101b]/70 p-4">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                            <div>
                              <p className="text-xs font-semibold text-[#d4af37]">{sarga.sargaIdentifier}</p>
                              <h5 className="font-serif text-base font-bold text-[#f3e9d2] mt-1">{sarga.editorialDescriptor}</h5>
                            </div>
                            <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-[10px] uppercase tracking-wide text-emerald-300">{sarga.reviewStatus.replaceAll("_", " ")}</span>
                          </div>
                          <p className="mt-3 text-xs leading-relaxed text-[#f3e9d2]/75">{sarga.summary}</p>
                          <div className="mt-4 flex flex-wrap gap-3">
                            <Link href={localizedPath(language, `/sargas/${sarga.recordKey}`)} className="inline-flex text-xs font-semibold text-[#d4af37] hover:text-[#f3e9d2]">{t("openReader")} <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
                            <a href={sarga.sourceLocator} target="_blank" rel="noreferrer" className="inline-flex text-xs font-semibold text-[#d4af37] hover:text-[#f3e9d2]">{t("openSource")}: {sarga.sourceId} · {sarga.editionId}</a>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <p className="rounded-xl border border-dashed border-[#d4af37]/25 bg-[#0b101b]/40 p-4 text-xs leading-relaxed text-[#f3e9d2]/65">0/{activeKanda.sargasCount} {t("sourceLocated")} {t("record")}s are published for this Kanda. {t("noPublicationPath")}</p>
                  )}
                </div>

                {activeSourceReview && <aside className="rounded-xl border border-sky-300/25 bg-sky-300/5 p-4" aria-label={t("nextSourceReview")}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-200">{t("nextSourceReview")}</p><h4 className="mt-1 font-serif text-lg font-semibold text-[#f3e9d2]">{activeSourceReview.sargaIdentifier} — {t("sourceAcquiredHeading")}</h4><p className="mt-2 text-xs leading-relaxed text-[#f3e9d2]/70">{activeSourceReview.englishEditorialDescriptor}</p></div><span className="w-fit rounded-full border border-sky-300/30 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-sky-100">{t("notPublished")}</span></div>
                  <div className="mt-3 grid gap-2 text-xs sm:grid-cols-3"><p className="rounded-lg border border-sky-300/15 bg-[#0b101b]/35 p-2 text-[#f3e9d2]/70"><strong className="text-[#f3e9d2]">{t("tamilTitle")}:</strong> {activeSourceReview.tamilTitleStatus.replaceAll("_", " ")}</p><p className="rounded-lg border border-sky-300/15 bg-[#0b101b]/35 p-2 text-[#f3e9d2]/70"><strong className="text-[#f3e9d2]">{t("sourceText")}:</strong> {activeSourceReview.sourceTextStatus.replaceAll("_", " ")}</p><p className="rounded-lg border border-sky-300/15 bg-[#0b101b]/35 p-2 text-[#f3e9d2]/70"><strong className="text-[#f3e9d2]">{t("dialogueLinks")}:</strong> {t("linksUnderReview")}</p></div>
                  <p className="mt-3 text-xs leading-relaxed text-sky-100">{t("reviewNoteExcluded")}</p>
                </aside>}

                {activeReadiness.length > 0 && <aside className="min-w-0 overflow-hidden rounded-xl border border-sky-300/25 bg-sky-300/5 p-4" aria-label={t("quarantinedSourceReadiness")}>
                  <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-200">{t("sourceAcquiredQueue")}</p><h4 className="mt-1 break-words font-serif text-lg font-semibold text-[#f3e9d2]">{t("verifiedLocatorsNotPublic")}</h4><p className="mt-1 break-words text-xs leading-relaxed text-[#f3e9d2]/65">{t("readinessOnlyText")}</p></div><span className="w-fit max-w-full break-words rounded-full border border-sky-300/30 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-sky-100">{t("noPublicationPath")}</span></div>
                  <div className="mt-4 grid min-w-0 gap-3 md:grid-cols-2">{activeReadiness.map((record) => <article key={record.recordKey} className="min-w-0 overflow-hidden rounded-lg border border-sky-300/15 bg-[#0b101b]/40 p-3"><div className="flex min-w-0 items-start justify-between gap-2"><div className="min-w-0"><p className="break-words font-serif text-sm font-semibold text-[#f3e9d2]">{record.sargaIdentifier}</p><p className="mt-1 break-words text-xs leading-relaxed text-[#f3e9d2]/65">{record.englishEditorialDescriptor}</p></div><span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-sky-100">{t("notPublished")}</span></div><div className="mt-3 flex flex-wrap gap-1.5">{record.readinessStates.map((state) => <span key={state} className="max-w-full break-words rounded-full border border-sky-300/20 px-2 py-0.5 text-[10px] uppercase tracking-wide text-sky-100">{state.replaceAll("_", " ")}</span>)}</div><a href={record.sourceLocator} target="_blank" rel="noreferrer" className="mt-3 inline-flex max-w-full break-words text-xs font-semibold text-sky-100 hover:text-[#f3e9d2]">{t("inspectSource")} <ArrowRight className="ml-1 h-3.5 w-3.5 shrink-0" /></a></article>)}</div>
                </aside>}

                {stagingLedger?.evidenceAvailable && activeKanda?.kandaNumber === 2 && <aside className="rounded-xl border border-amber-300/25 bg-amber-300/5 p-4" aria-label={t("quarantinedStagingBranch")}>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-200">{t("physicalStagingBranch")}</p><h4 className="mt-1 font-serif text-lg font-semibold text-[#f3e9d2]">{formatTranslation(t("recordsUnderReconciliation"), { n: stagingLedger.physicallyAvailableUniqueRecords })}</h4><p className="mt-1 text-xs leading-relaxed text-[#f3e9d2]/65">{formatTranslation(t("latestPhysicalCoverage"), { s: stagingLedger.latestVerifiedSarga })}</p></div><span className="w-fit rounded-full border border-amber-300/30 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-100">{t("underReviewNotCanonical")}</span></div><div className="mt-3 flex flex-wrap gap-1.5">{stagingLedger.readinessStates.map((state: string) => <span key={state} className="rounded-full border border-amber-300/20 px-2 py-0.5 text-[10px] uppercase tracking-wide text-amber-100">{state.replaceAll("_", " ")}</span>)}</div>
                </aside>}

                <aside className="rounded-xl border border-[#d4af37]/20 bg-[#0b101b]/45 p-4" aria-label={t("sargaMetadataAvailability")}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h4 className="font-serif text-base font-semibold text-[#d4af37]">{t("sargaMetadataAvailability")}</h4>
                      <p className="mt-1 text-xs text-[#f3e9d2]/60">{t("availabilityFieldwise")}</p>
                    </div>
                    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${coverageState(activeKanda.kandaNumber).tone}`}>{coverageState(activeKanda.kandaNumber).label}</span>
                  </div>
                  <dl className="mt-4 grid gap-3 text-xs sm:grid-cols-2">
                    <div className="rounded-lg border border-white/10 p-3"><dt className="font-semibold text-[#f3e9d2]">{t("editionLocatorReader")}</dt><dd className="mt-1 text-[#f3e9d2]/60">{visibleSargas.length ? t("verifiedListed") : t("notAcquiredKanda")}</dd></div>
                    <div className="rounded-lg border border-white/10 p-3"><dt className="font-semibold text-[#f3e9d2]">{t("englishDescriptorSummary")}</dt><dd className="mt-1 text-[#f3e9d2]/60">{visibleSargas.length ? t("availableListed") : t("notAcquiredKanda")}</dd></div>
                    <div className="rounded-lg border border-white/10 p-3"><dt className="font-semibold text-[#f3e9d2]">{t("tamilReadingFields")}</dt><dd className="mt-1 text-[#f3e9d2]/60">{t("underReviewNotAcquired")}</dd></div>
                    <div className="rounded-lg border border-white/10 p-3"><dt className="font-semibold text-[#f3e9d2]">{t("translationState")}</dt><dd className="mt-1 text-[#f3e9d2]/60">{t("noUnreviewedTranslation")}</dd></div>
                  </dl>
                </aside>
              </div>
            )}
          </div>
        )}
      </main>

      <RamaFooter />
    </div>
  );
}
