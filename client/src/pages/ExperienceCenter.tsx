import { useMemo, useState } from "react";
import { Link } from "wouter";
import { CalendarDays, Check, Copy, Download, Heart, Info, ShieldCheck, Sparkles, Users, Waves } from "lucide-react";
import { RamaNavbar } from "@/components/RamaNavbar";
import { RamaFooter } from "@/components/RamaFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { APPROVED_UNIVERSE_RECORDS } from "@/lib/knowledgeUniverse";
import { useTranslation } from "@/contexts/MultilingualContext";

type Mode = "daily" | "family" | "festival" | "devotion" | "setu";
const ageBands = ["5–7", "8–10", "11–13", "14–17"] as const;
const festivals = ["Rama Navami", "Vivaha Panchami", "Sita Navami", "Hanuman-related traditions", "Deepavali / Rama-return traditions"];
const dailyLabels = ["Today’s Rama Wisdom", "Today’s Character", "Today’s Sarga", "Today’s Reflection", "Today’s Practice"];

function dayIndex(length: number) {
  const now = new Date();
  const start = Date.UTC(now.getUTCFullYear(), 0, 0);
  const day = Math.floor((Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - start) / 86400000);
  return length ? day % length : 0;
}

export default function ExperienceCenter() {
  const { t } = useTranslation();
  const [mode, setMode] = useState<Mode>("daily");
  const [age, setAge] = useState<(typeof ageBands)[number]>("8–10");
  const [copied, setCopied] = useState(false);
  const record = useMemo(() => APPROVED_UNIVERSE_RECORDS[dayIndex(APPROVED_UNIVERSE_RECORDS.length)], []);
  const shareText = `${record.titleEn} — ${record.locator}. Source-grounded RamaVerse discovery. Record ${record.id}.`;

  async function copyShareCard() {
    if (!navigator.clipboard) return;
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="min-h-screen bg-[#080d17] text-[#f4ead4]">
      <RamaNavbar />
      <main id="main-content" className="mx-auto max-w-7xl px-4 pb-20 pt-12 sm:px-6 lg:px-8">
        <section className="rv-experience-hero mb-8 overflow-hidden rounded-[2rem] border border-[#d7b45a]/25 px-6 py-10 sm:px-10">
          <div className="relative z-10 max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#d7b45a]/30 bg-[#d7b45a]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#f4d98b]"><Sparkles className="h-3.5 w-3.5" />RamaVerse Experience Studio</div>
            <h1 className="font-serif text-4xl font-bold tracking-tight text-[#fff7e7] sm:text-6xl">A daily rhythm for learning, reflection, and devotion.</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#f4ead4]/75">Small, source-aware experiences for a family, a learner, or a quiet moment. Scripture, tradition, editorial reflection, and modern application remain visibly distinct.</p>
            <div className="mt-7 flex flex-wrap gap-3"><Link href="/walk-with-rama"><Button className="bg-[#d7b45a] text-[#0b101a] hover:bg-[#f4d98b]">Walk with Rama</Button></Link><Link href="/search"><Button variant="outline" className="border-[#d7b45a]/40 text-[#fff7e7]">Explore the evidence</Button></Link></div>
          </div>
          <div className="rv-experience-sun" aria-hidden="true" />
        </section>

        <nav aria-label="Experience modes" className="mb-8 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-2 sm:grid-cols-5">
          {(["daily", "family", "festival", "devotion", "setu"] as Mode[]).map((item) => <button key={item} type="button" aria-pressed={mode === item} onClick={() => setMode(item)} className={`rounded-xl px-3 py-3 text-sm font-semibold capitalize transition ${mode === item ? "bg-[#d7b45a] text-[#0b101a]" : "text-[#f4ead4]/70 hover:bg-white/10 hover:text-white"}`}>{item === "setu" ? "Rama Setu" : item}</button>)}
        </nav>

        {mode === "daily" && <section aria-labelledby="daily-heading" className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]"><div className="rv-glass-card rounded-3xl p-6 sm:p-8"><div className="flex items-center gap-3 text-[#d7b45a]"><CalendarDays className="h-5 w-5" /><span className="text-xs font-bold uppercase tracking-[0.18em]">Deterministic daily experience</span></div><h2 id="daily-heading" className="mt-4 font-serif text-3xl font-bold text-white">{record.titleEn}</h2><p className="mt-3 text-sm leading-7 text-[#f4ead4]/75">{record.searchText}</p><div className="mt-6 grid gap-3 sm:grid-cols-2">{dailyLabels.map((label, index) => <div key={label} className="rounded-2xl border border-white/10 bg-[#0d1725]/80 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-[#d7b45a]">{label}</p><p className="mt-2 text-sm text-[#f4ead4]/75">{index === 2 ? record.locator : index === 4 ? "A quiet reading practice; no promised outcome." : "Available only where this record provides evidence."}</p></div>)}</div></div><EvidenceCard record={record} /></section>}

        {mode === "family" && <section aria-labelledby="family-heading" className="grid gap-5 lg:grid-cols-[.9fr_1.1fr]"><div className="rv-glass-card rounded-3xl p-6 sm:p-8"><div className="flex items-center gap-3 text-[#d7b45a]"><Users className="h-5 w-5" /><span className="text-xs font-bold uppercase tracking-[0.18em]">Family mode</span></div><h2 id="family-heading" className="mt-4 font-serif text-3xl font-bold text-white">Learn together, at the right depth.</h2><p className="mt-3 text-sm leading-7 text-[#f4ead4]/75">Choose an age band to set the discussion lens. The prompt is educational scaffolding, not a new scripture claim.</p><div className="mt-6 flex flex-wrap gap-2">{ageBands.map((band) => <button key={band} type="button" aria-pressed={age === band} onClick={() => setAge(band)} className={`rounded-full border px-4 py-2 text-sm ${age === band ? "border-[#d7b45a] bg-[#d7b45a] text-[#0b101a]" : "border-white/15 text-[#f4ead4]/75"}`}>{band}</button>)}</div></div><div className="rv-glass-card rounded-3xl p-6 sm:p-8"><Badge className="bg-[#557b63] text-white">Source-aware activity</Badge><h3 className="mt-5 font-serif text-2xl font-bold text-white">Read, discuss, connect</h3><div className="mt-5 space-y-3 text-sm text-[#f4ead4]/80"><p><strong className="text-[#f4d98b]">Story:</strong> Begin with the linked record: {record.titleEn}.</p><p><strong className="text-[#f4d98b]">Question:</strong> What choice, relationship, or responsibility can you notice in this source?</p><p><strong className="text-[#f4d98b]">Age lens:</strong> {age} — explain one idea in your own words.</p><p><strong className="text-[#f4d98b]">Activity:</strong> Find the source locator together and compare what is stated with what is inferred.</p></div><Link href={`/sargas/${encodeURIComponent(record.id)}`}><Button variant="outline" className="mt-6 border-[#d7b45a]/40 text-[#fff7e7]">Open source record</Button></Link></div></section>}

        {mode === "festival" && <section aria-labelledby="festival-heading" className="rv-glass-card rounded-3xl p-6 sm:p-8"><div className="flex items-center gap-3 text-[#d7b45a]"><CalendarDays className="h-5 w-5" /><span className="text-xs font-bold uppercase tracking-[0.18em]">Tradition-separated calendar</span></div><h2 id="festival-heading" className="mt-4 font-serif text-3xl font-bold text-white">Festival mode, without false precision.</h2><p className="mt-3 max-w-3xl text-sm leading-7 text-[#f4ead4]/75">These are tradition metadata entries. Regional observance and calendar dates vary; RamaVerse does not hard-code annual dates without validated calendar logic.</p><div className="mt-7 grid gap-3 md:grid-cols-2">{festivals.map((festival) => <div key={festival} className="rounded-2xl border border-white/10 bg-[#0d1725]/80 p-5"><div className="flex items-center gap-2"><Info className="h-4 w-4 text-[#d7b45a]" /><h3 className="font-semibold text-white">{festival}</h3></div><p className="mt-3 text-sm text-[#f4ead4]/65">Tradition note and regional context require an approved source record before publication.</p><Badge variant="outline" className="mt-4 border-[#d7b45a]/30 text-[#f4d98b]">REVIEW REQUIRED</Badge></div>)}</div></section>}

        {mode === "devotion" && <section aria-labelledby="devotion-heading" className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]"><div className="rv-glass-card rounded-3xl p-6 sm:p-8"><div className="flex items-center gap-3 text-[#d7b45a]"><Heart className="h-5 w-5" /><span className="text-xs font-bold uppercase tracking-[0.18em]">Devotional library contract</span></div><h2 id="devotion-heading" className="mt-4 font-serif text-3xl font-bold text-white">Practice with clarity and care.</h2><p className="mt-3 text-sm leading-7 text-[#f4ead4]/75">Rama Nama, Sita-Rama practice, Rama Raksha, Rama Ashtottara, Sundarkand, Hanuman Chalisa, and other works may appear as metadata, links, or review states until text and audio rights are verified.</p><div className="mt-6 grid gap-3 sm:grid-cols-2"><StatusTile title="Read aloud" value="Available where source text is present" /><StatusTile title="Follow-along" value="Architecture only" /><StatusTile title="Favorites / history" value="Existing library surface" /><StatusTile title="Outcome claims" value="Prohibited" /></div></div><div className="rv-glass-card rounded-3xl p-6 sm:p-8"><ShieldCheck className="h-7 w-7 text-[#7fb9a2]" /><h3 className="mt-4 font-serif text-2xl font-bold text-white">Responsible framing</h3><p className="mt-3 text-sm leading-7 text-[#f4ead4]/75">Use “traditionally associated with…” for tradition claims, and never promise a cure, wealth, marriage, legal victory, or supernatural result.</p><Link href="/library"><Button className="mt-6 bg-[#d7b45a] text-[#0b101a]">Open library</Button></Link></div></section>}

        {mode === "setu" && <section aria-labelledby="setu-heading" className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]"><div className="rv-glass-card rounded-3xl p-6 sm:p-8"><div className="flex items-center gap-3 text-[#6ea4c5]"><Waves className="h-5 w-5" /><span className="text-xs font-bold uppercase tracking-[0.18em]">Rama Setu evidence sequence</span></div><h2 id="setu-heading" className="mt-4 font-serif text-3xl font-bold text-white">A source-aware journey across distinct layers.</h2><div className="mt-6 grid gap-3 sm:grid-cols-2">{["Textual narrative", "Characters", "Planning", "Journey", "Construction narrative", "Leadership / teamwork interpretation", "Source evidence", "Tradition notes"].map((item) => <div key={item} className="rounded-2xl border border-white/10 bg-[#0d1725]/80 p-4 text-sm text-[#f4ead4]/80"><span className="mr-2 text-[#d7b45a]">✦</span>{item}</div>)}</div></div><div className="rv-glass-card rounded-3xl p-6 sm:p-8"><h3 className="font-serif text-2xl font-bold text-white">What is not claimed</h3><p className="mt-3 text-sm leading-7 text-[#f4ead4]/75">Scripture and tradition are kept separate from modern historical or archaeological claims. No coordinates, dates, engineering claims, or scientific conclusions are asserted without dedicated governed evidence.</p><Link href="/journey"><Button variant="outline" className="mt-6 border-[#6ea4c5]/50 text-[#fff7e7]">Open Journey Atlas</Button></Link></div></section>}

        <section aria-labelledby="share-heading" className="mt-8 rounded-3xl border border-[#d7b45a]/20 bg-[#101b2b]/80 p-6 sm:p-8"><div className="flex flex-wrap items-start justify-between gap-5"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d7b45a]">Shareable evidence card</p><h2 id="share-heading" className="mt-2 font-serif text-2xl font-bold text-white">Share the source, not an invented quote.</h2><p className="mt-2 max-w-2xl text-sm text-[#f4ead4]/70">The card keeps the record ID, locator, and RamaVerse attribution. It does not turn paraphrase into direct speech.</p></div><Button onClick={copyShareCard} className="bg-[#d7b45a] text-[#0b101a]">{copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}{copied ? "Copied" : "Copy evidence card"}</Button></div><div className="mt-6 rounded-2xl border border-white/10 bg-[#0a111d] p-5 text-sm text-[#f4ead4]/80">{shareText}<span className="mt-3 block text-xs text-[#d7b45a]">RamaVerse · source-grounded discovery · verify the linked record</span></div></section>

        <section aria-label="Offline pack status" className="mt-8 flex flex-col gap-4 rounded-2xl border border-[#7fb9a2]/20 bg-[#10221e]/55 p-5 text-sm text-[#d8f1e3]/80 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><Download className="mt-0.5 h-5 w-5 text-[#7fb9a2]" /><div><strong className="text-[#d8f1e3]">Offline pack contract:</strong> manifest, hash, schema, language, content version, activation, rollback, and corrupt-pack rejection are defined. No pack is downloaded silently.</div></div><Badge variant="outline" className="w-fit border-[#7fb9a2]/40 text-[#bce8d0]">CONTRACT READY</Badge></section>
      </main>
      <RamaFooter />
    </div>
  );
}

function EvidenceCard({ record }: { record: (typeof APPROVED_UNIVERSE_RECORDS)[number] }) { return <aside aria-label="Evidence panel" className="rv-glass-card rounded-3xl p-6 sm:p-8"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d7b45a]">Evidence panel</p><h3 className="mt-4 font-serif text-2xl font-bold text-white">{record.titleEn}</h3><dl className="mt-5 space-y-3 text-sm"><div><dt className="text-[#f4ead4]/45">Record ID</dt><dd className="font-mono text-[#f4ead4]/85">{record.id}</dd></div><div><dt className="text-[#f4ead4]/45">Locator</dt><dd className="text-[#f4ead4]/85">{record.locator}</dd></div><div><dt className="text-[#f4ead4]/45">Source IDs</dt><dd className="font-mono text-[#f4ead4]/85">{record.sourceIds.join(", ")}</dd></div></dl><Link href={`/sargas/${encodeURIComponent(record.id)}`}><Button variant="outline" className="mt-6 border-[#d7b45a]/40 text-[#fff7e7]">Read source record</Button></Link></aside> }
function StatusTile({ title, value }: { title: string; value: string }) { return <div className="rounded-2xl border border-white/10 bg-[#0d1725]/80 p-4"><p className="text-xs font-semibold text-[#d7b45a]">{title}</p><p className="mt-2 text-sm text-[#f4ead4]/70">{value}</p></div> }
