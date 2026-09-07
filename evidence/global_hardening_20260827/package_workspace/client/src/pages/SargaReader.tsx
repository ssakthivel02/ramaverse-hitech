import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import { BookMarked, ChevronLeft, ChevronRight, ExternalLink, Minus, Plus, ShieldCheck } from "lucide-react";
import { RamaNavbar } from "@/components/RamaNavbar";
import { RamaFooter } from "@/components/RamaFooter";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useLibrary } from "@/contexts/LibraryContext";
import { formatTranslation, localizedPath, SUPPORTED_LANGUAGES, useTranslation } from "@/contexts/MultilingualContext";
import { ReaderPageTurn } from "@/components/motion/MotionPrimitives";
import type { IntelligenceLocale, IntelligenceRecord } from "../../../shared/intelligence";
import { ContextualReaderAssistant, ExplainForChildren, ExplainInTamil, ExplainSimply, ReadAloud, SourceComparisonCard } from "@/components/intelligence/IntelligencePanels";

export default function SargaReader() {
  const params = useParams<{ recordKey: string }>();
  const [, setLocation] = useLocation();
  const { language, setLanguage, t, getLanguageMeta } = useTranslation();
  const { addBookmark, removeBookmark, isBookmarked, markSargaRead, markSargaUnread, readingProgress } = useLibrary();
  const [fontStep, setFontStep] = useState(0);
  const [sourceOpen, setSourceOpen] = useState(false);
  const recordKey = params.recordKey || "";
  const { data, isLoading } = trpc.ramaverse.getSargaDetail.useQuery({ recordKey }, { enabled: Boolean(recordKey) });
  const sarga = data?.current;
  const languageMeta = getLanguageMeta(language);
  const intelligenceLocale: IntelligenceLocale = (["en", "ta", "hi", "te", "kn", "ml"] as const).includes(language as IntelligenceLocale) ? language as IntelligenceLocale : "en";
  const intelligenceRecord: IntelligenceRecord | undefined = sarga ? {
    recordId: sarga.recordKey,
    type: "sarga",
    title: sarga.editorialDescriptor,
    excerpt: sarga.summary,
    kanda: `Kanda ${sarga.kandaNumber}`,
    sarga: sarga.sargaIdentifier,
    sourceLocator: sarga.sourceLocator,
    confidence: sarga.confidence === "source_verified" ? "high" : "medium",
  } : undefined;
  const bookmarked = sarga ? isBookmarked(sarga.recordKey, "sarga") : false;
  const isMarkedRead = Boolean(sarga && readingProgress.some((entry) => entry.recordKey === sarga.recordKey));
  const metadataAvailability = [
    [t("kandaSummary"), true, t("recordPublished")],
    [t("openSource"), Boolean(sarga?.sourceLocator), t("directLocator")],
    [t("sourceText"), false, t("sectionNotPublished")],
    [t("characters"), false, t("entityNotPublished")],
    [t("dialogueLinks"), false, t("dialogueNotPublished")],
  ] as const;

  useEffect(() => {
    if (sarga) markSargaRead(sarga.recordKey);
  }, [sarga?.recordKey]);

  const fontClass = useMemo(() => fontStep < 0 ? "text-sm" : fontStep > 0 ? "text-lg" : "text-base", [fontStep]);

  const toggleBookmark = () => {
    if (!sarga) return;
    if (bookmarked) removeBookmark(sarga.recordKey, "sarga");
    else addBookmark({ type: "sarga", itemId: sarga.recordKey, title: `${sarga.sargaIdentifier}: ${sarga.editorialDescriptor}` });
  };

  if (isLoading) return <div className="rv-shell min-h-screen bg-[#070b14] text-[#f3e9d2]"><RamaNavbar /><main role="status" aria-live="polite" className="mx-auto max-w-4xl px-6 py-24">{t("readerLoading")}</main><RamaFooter /></div>;

  if (!sarga) return <div className="rv-shell min-h-screen bg-[#070b14] text-[#f3e9d2]"><RamaNavbar /><main className="mx-auto max-w-4xl px-6 py-24"><h1 className="font-serif text-3xl text-[#d4af37]">{t("sargaUnavailable")}</h1><p className="mt-3 text-[#f3e9d2]/70">{t("sourceRecordOnly")}</p><Link href={localizedPath(language, "/kandas")} className="mt-6 inline-block text-[#d4af37]">{t("returnKandas")}</Link></main><RamaFooter /></div>;

  return (
    <div className="rv-shell min-h-screen bg-[#070b14] text-[#f3e9d2]">
      <RamaNavbar />
      <main className="rv-section mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <Link href={localizedPath(language, "/kandas")} className="inline-flex items-center text-sm text-[#d4af37] hover:text-[#f3e9d2]"><ChevronLeft className="mr-1 h-4 w-4" /> {t("kandaExplorer")}</Link>
        <ReaderPageTurn className="rv-glass script-safe mt-6 rounded-2xl p-6 sm:p-9">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d4af37]">{sarga.editionId} · Kanda {sarga.kandaNumber}</p>
              <h1 className="script-safe mt-3 font-serif text-3xl font-bold gold-gradient-text sm:text-4xl">{sarga.sargaIdentifier}</h1>
              <p className="script-safe mt-2 font-serif text-lg text-[#f3e9d2]">{sarga.editorialDescriptor}</p>
            </div>
            <span className="inline-flex w-fit items-center rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-xs uppercase tracking-wide text-emerald-200"><ShieldCheck className="mr-1.5 h-3.5 w-3.5" />{sarga.reviewStatus.replaceAll("_", " ")}</span>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-2 border-y border-white/10 py-4">
            <Button variant="outline" size="sm" onClick={toggleBookmark} className="border-[#d4af37]/40 text-[#d4af37]"><BookMarked className="mr-2 h-4 w-4" />{bookmarked ? t("saved") : t("save")}</Button>
            <Button variant="outline" size="sm" onClick={() => sarga && (isMarkedRead ? markSargaUnread(sarga.recordKey) : markSargaRead(sarga.recordKey))} className="border-[#d4af37]/40 text-[#d4af37]">{isMarkedRead ? t("markUnread") : t("markRead")}</Button>
            <Button variant="outline" size="sm" onClick={() => setFontStep(value => Math.max(-1, value - 1))} aria-label={t("decreaseFont")}><Minus className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" onClick={() => setFontStep(value => Math.min(1, value + 1))} aria-label={t("increaseFont")}><Plus className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" onClick={() => setSourceOpen(value => !value)} className="border-[#d4af37]/40 text-[#d4af37]">{sourceOpen ? t("hideSource") : t("sourcePanel")}</Button>
            <label className="script-safe ml-auto flex min-w-0 items-center gap-2 text-xs text-[#f3e9d2]/70">{t("readerLanguage")}
              <select aria-label={t("readerLanguage")} value={language} onChange={(event) => setLanguage(event.target.value as typeof language)} className="rounded-md border border-[#d4af37]/35 bg-[#0b101b] px-2 py-1 text-[#f3e9d2] outline-none focus:ring-2 focus:ring-[#d4af37]/60">
                {SUPPORTED_LANGUAGES.map((item) => <option key={item.code} value={item.code}>{item.nativeLabel}</option>)}
              </select>
            </label>
          </div>
          <p className="mt-3 text-xs text-[#f3e9d2]/60" aria-live="polite">{isMarkedRead ? t("markedReadDevice") : t("progressDevice")} {t("readerStatusNotice")}</p>
          <article className={`script-safe mt-7 leading-8 text-[#f3e9d2]/85 ${fontClass}`}>
            <p>{sarga.summary}</p>
            <p className="mt-6 rounded-xl border border-amber-300/20 bg-amber-300/5 p-4 text-sm text-amber-100/80">{t("summaryDisclosure")}</p>
          </article>
          <section className="mt-7 rounded-xl border border-[#d7b45a]/20 bg-[#101a2a]/55 p-5" aria-labelledby="reader-intelligence-title">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><h2 id="reader-intelligence-title" className="font-serif text-lg text-[#d4af37]">Reader intelligence</h2><p className="mt-1 text-xs text-[#f3e9d2]/60">Canonical context only. Draft and staging records remain excluded.</p></div>
              <ReadAloud text={sarga.summary} locale={intelligenceLocale} />
            </div>
            <ContextualReaderAssistant record={intelligenceRecord} locale={intelligenceLocale} />
            <div className="grid gap-3 md:grid-cols-3"><ExplainSimply text={sarga.summary} locale={intelligenceLocale} /><ExplainForChildren text={null} locale={intelligenceLocale} /><ExplainInTamil text={intelligenceLocale === "ta" ? sarga.summary : null} locale={intelligenceLocale} /></div>
            <SourceComparisonCard records={intelligenceRecord ? [intelligenceRecord] : []} locale={intelligenceLocale} />
          </section>
          <section className="mt-7 rounded-xl border border-white/10 bg-[#0b101b]/45 p-5" aria-labelledby="sarga-metadata-title">
            <h2 id="sarga-metadata-title" className="font-serif text-lg text-[#d4af37]">{t("metadataAvailability")}</h2>
            <p className="mt-1 text-xs text-[#f3e9d2]/60">{t("unavailableFields")}</p>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              {metadataAvailability.map(([label, available, detail]) => <div key={label} className="rounded-lg border border-white/10 bg-[#162032]/50 p-3"><dt className="text-sm font-semibold text-[#f3e9d2]">{label}</dt><dd className={`mt-1 text-xs ${available ? "text-emerald-200" : "text-amber-200"}`}>{available ? t("available") : t("notAcquired")} · {detail}</dd></div>)}
            </dl>
          </section>
          {sourceOpen && <aside style={{ minWidth: 0, overflowWrap: "anywhere", lineHeight: 1.5 }} className="script-safe mt-7 rounded-xl border border-[#d4af37]/25 bg-[#0b101b]/70 p-5 text-sm leading-relaxed"><h2 className="font-serif text-lg text-[#d4af37]">{t("langStatus")}</h2><dl className="script-safe mt-3 space-y-2 text-[#f3e9d2]/75"><div><dt className="inline font-semibold text-[#f3e9d2]">{t("sourceId")}: </dt><dd className="inline">{sarga.sourceId}</dd></div><div><dt className="inline font-semibold text-[#f3e9d2]">{t("tradition")}: </dt><dd className="inline">{sarga.traditionId}</dd></div><div><dt className="inline font-semibold text-[#f3e9d2]">{t("selectedInterface")}: </dt><dd className="inline">{languageMeta.nativeLabel} — {languageMeta.contentStatus.replaceAll("_", " ")}</dd></div></dl><a href={sarga.sourceLocator} target="_blank" rel="noreferrer" className="mt-4 inline-flex max-w-full items-center font-semibold text-[#d4af37] hover:text-[#f3e9d2]">{t("openSourceLocator")} <ExternalLink className="ml-1 h-3.5 w-3.5 shrink-0" /></a></aside>}
          <div className="mt-8 grid grid-cols-1 gap-3 border-t border-white/10 pt-6 sm:grid-cols-2">
            {data.previous ? <Button variant="outline" onClick={() => setLocation(localizedPath(language, `/sargas/${data.previous?.recordKey}`))} className="justify-start border-[#d4af37]/30 text-[#f3e9d2]"><ChevronLeft className="mr-2 h-4 w-4" />{t("previousSarga")}</Button> : <span className="rounded-lg border border-dashed border-white/15 px-4 py-2 text-sm text-[#f3e9d2]/45">{t("noEarlier")}</span>}
            {data.next ? <Button variant="outline" onClick={() => setLocation(localizedPath(language, `/sargas/${data.next?.recordKey}`))} className="justify-end border-[#d4af37]/30 text-[#f3e9d2]">{t("nextSarga")}<ChevronRight className="ml-2 h-4 w-4" /></Button> : <span className="rounded-lg border border-dashed border-white/15 px-4 py-2 text-right text-sm text-[#f3e9d2]/45">{t("noLater")}</span>}
          </div>
        </ReaderPageTurn>
      </main>
      <RamaFooter />
    </div>
  );
}
