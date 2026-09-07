import { useMemo, useState } from "react";
import { ArrowRight, BookOpen, CheckCircle2, Compass, Heart, Leaf, LockKeyhole, MessageCircle, Moon, Play, ShieldCheck, Sparkles, Sun, Waves } from "lucide-react";
import { Link } from "wouter";
import { RamaFooter } from "@/components/RamaFooter";
import { RamaNavbar } from "@/components/RamaNavbar";
import { FadeReveal } from "@/components/motion/MotionPrimitives";
import { Button } from "@/components/ui/button";
import { localizedPath, useTranslation } from "@/contexts/MultilingualContext";
import { APPROVED_UNIVERSE_RECORDS } from "@/lib/knowledgeUniverse";

type Situation = { id: string; icon: typeof Heart; label: string; lesson: string; action: string; search: string };

const situations: Situation[] = [
  { id: "courage", icon: ShieldCheck, label: "I need courage", lesson: "Courage can begin as the next honest step, taken with care rather than certainty.", action: "Name one small action you can take today, then ask for help where it is needed.", search: "courage duty" },
  { id: "worry", icon: Waves, label: "I am worried", lesson: "When the mind is crowded, return to what is yours to do now and let the wider result remain open.", action: "Write down one responsibility for today and one concern you can set down for the evening.", search: "duty patience" },
  { id: "failure", icon: Leaf, label: "I failed", lesson: "A difficult outcome can become a teacher without becoming your identity.", action: "Describe what happened without blame, keep one lesson, and choose one repair.", search: "learning dharma" },
  { id: "decision", icon: Compass, label: "I have a difficult decision", lesson: "A careful decision weighs duty, truth, consequences, and the people entrusted to you.", action: "List the duties involved, the people affected, and the choice you can explain honestly.", search: "decision dharma" },
  { id: "anger", icon: Moon, label: "I am angry", lesson: "Pause before action; restraint creates room for a response that does not deepen harm.", action: "Take three slow breaths and delay the message or decision until your body settles.", search: "restraint patience" },
  { id: "patience", icon: Sun, label: "I need patience", lesson: "Patience is active attention: staying with the next right step while time does its work.", action: "Choose a ten-minute practice of quiet attention, then return to one concrete task.", search: "patience duty" },
  { id: "family", icon: Heart, label: "I have family problems", lesson: "Care and truth can belong together; listen first, speak without humiliation, and protect boundaries.", action: "Begin with one conversation whose purpose is understanding, not winning.", search: "family truth" },
  { id: "leadership", icon: CheckCircle2, label: "I need leadership guidance", lesson: "Leadership is responsibility made visible through conduct, listening, and steady service.", action: "Make the standard you ask of others visible in your own next decision.", search: "leadership duty" },
  { id: "lonely", icon: MessageCircle, label: "I feel lonely", lesson: "Connection can begin with one truthful message and one place where you are willing to be seen.", action: "Contact a trusted person and say clearly what kind of support would help.", search: "friendship service" },
  { id: "discipline", icon: Play, label: "I need discipline", lesson: "Discipline becomes gentler when it is shaped as a repeatable practice rather than a punishment.", action: "Set a ten-minute version of the practice and return to it tomorrow.", search: "discipline practice" },
  { id: "hope", icon: Sparkles, label: "I need hope", lesson: "Hope is not a promise of an outcome; it is the decision to keep a worthy action possible.", action: "Choose one action that keeps care, truth, or service alive today.", search: "hope service" },
];

function pickEvidence(query: string) {
  const tokens = query.split(" ");
  const publicRecords = APPROVED_UNIVERSE_RECORDS.filter(record => !record.id.startsWith("STAGING-"));
  return publicRecords.find(record => tokens.some(token => record.searchText.toLowerCase().includes(token))) ?? publicRecords[0];
}

export default function WalkWithRama() {
  const { language } = useTranslation();
  const [selectedId, setSelectedId] = useState("courage");
  const [audioOn, setAudioOn] = useState(false);
  const selected = situations.find(item => item.id === selectedId) ?? situations[0];
  const evidence = useMemo(() => pickEvidence(selected.search), [selected.search]);

  return (
    <div className="min-h-screen bg-[#070b14] text-[#f3e9d2]">
      <RamaNavbar />
      <main>
        <section className="walk-hero" aria-labelledby="walk-title">
          <div className="walk-sky" aria-hidden="true" />
          <div className="walk-sarayu" aria-hidden="true"><span /><span /><span /></div>
          <div className="walk-bow" aria-hidden="true"><span /><i /><b /></div>
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:px-8 lg:py-28">
            <FadeReveal className="relative z-10" delay={40}>
              <div className="rv-eyebrow"><ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> Source-grounded reflection</div>
              <p className="mt-8 text-xs uppercase tracking-[.3em] text-[#d7b45a]">RamaVerse · a quiet companion</p>
              <h1 id="walk-title" className="mt-4 max-w-3xl font-serif text-5xl font-semibold leading-[1.02] text-[#fff6df] sm:text-7xl">Walk with Rama</h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-[#f3e9d2]/72">Enter a moment from the Ramayana, listen for its context, and choose one small action for your own day.</p>
              <p className="mt-5 max-w-xl border-l border-[#d7b45a]/45 pl-4 text-sm leading-7 text-[#d7b45a]">This is a source-grounded reflection inspired by Rama&apos;s words and actions in the Ramayana—not a claim that Rama is literally speaking through this experience.</p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a href="#situations" className="inline-flex h-11 items-center rounded-full bg-[#d7b45a] px-5 text-sm font-semibold text-[#070b14] transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4d98b]">Begin with a situation <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" /></a>
                <button type="button" className="inline-flex h-11 items-center gap-2 rounded-full border border-[#d7b45a]/35 px-5 text-sm text-[#f3e9d2]/80 transition-colors hover:bg-[#d7b45a]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4d98b]" aria-pressed={audioOn} onClick={() => setAudioOn(value => !value)}><span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#d7b45a]/15"><Waves className="h-3.5 w-3.5 text-[#d7b45a]" aria-hidden="true" /></span>{audioOn ? "Sound on" : "Sound off by default"}</button>
              </div>
            </FadeReveal>
            <FadeReveal className="relative z-10" delay={140}>
              <div className="walk-portal" aria-label="A symbolic dawn, bow, and river motif inspired by Ayodhya" role="img"><div className="walk-silhouette"><div className="walk-head" /><div className="walk-shoulder" /><div className="walk-robe" /><div className="walk-bow-line" /></div><div className="walk-light" /><div className="walk-portal-caption"><span className="text-[10px] uppercase tracking-[.2em] text-[#d7b45a]">A gentle beginning</span><span className="mt-1 text-sm text-[#f3e9d2]/70">Dawn over a remembered path</span></div></div>
            </FadeReveal>
          </div>
        </section>

        <section id="situations" className="mx-auto max-w-7xl scroll-mt-10 px-5 py-16 lg:px-8 lg:py-24" aria-labelledby="situations-title">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs uppercase tracking-[.24em] text-[#d7b45a]">The first step</p><h2 id="situations-title" className="mt-2 font-serif text-3xl font-semibold sm:text-4xl">What are you carrying today?</h2></div><p className="max-w-md text-sm leading-6 text-[#f3e9d2]/58">Choose a doorway. The reflection stays grounded in the approved local corpus and keeps the source visible.</p></div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {situations.map(item => { const Icon = item.icon; const active = item.id === selectedId; return <button key={item.id} type="button" aria-pressed={active} onClick={() => setSelectedId(item.id)} className={`walk-situation ${active ? "walk-situation-active" : ""}`}><Icon className="h-5 w-5 text-[#d7b45a]" aria-hidden="true" /><span>{item.label}</span><span className="ml-auto text-xs text-[#d7b45a]/65" aria-hidden="true">{active ? "Selected" : ""}</span></button>; })}
          </div>
        </section>

        <section className="border-y border-[#d7b45a]/15 bg-[#0d1524]/55 px-5 py-16 lg:px-8 lg:py-24" aria-labelledby="reflection-title">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.15fr_.85fr]">
            <article className="walk-reflection rounded-3xl p-6 sm:p-9" aria-live="polite"><div className="flex items-center gap-2 text-xs uppercase tracking-[.2em] text-[#d7b45a]"><Sparkles className="h-4 w-4" aria-hidden="true" /> Your reflection</div><h2 id="reflection-title" className="mt-5 font-serif text-3xl font-semibold text-[#fff6df]">{selected.label}</h2><p className="mt-6 text-xl leading-9 text-[#f3e9d2]/85">{selected.lesson}</p><div className="mt-8 grid gap-4 sm:grid-cols-2"><div className="rounded-2xl border border-white/10 bg-white/[.03] p-5"><p className="text-[10px] uppercase tracking-[.18em] text-[#d7b45a]">A practical action</p><p className="mt-3 text-sm leading-7 text-[#f3e9d2]/72">{selected.action}</p></div><div className="rounded-2xl border border-white/10 bg-white/[.03] p-5"><p className="text-[10px] uppercase tracking-[.18em] text-[#d7b45a]">A gentle reminder</p><p className="mt-3 text-sm leading-7 text-[#f3e9d2]/72">No guaranteed outcome is promised. Let this be a beginning, not a verdict.</p></div></div></article>
            <aside className="rounded-3xl border border-[#d7b45a]/18 bg-[#101a2a] p-6 sm:p-8" aria-labelledby="evidence-title"><div className="flex items-center gap-2 text-xs uppercase tracking-[.2em] text-[#d7b45a]"><LockKeyhole className="h-4 w-4" aria-hidden="true" /> Trust & source</div><h2 id="evidence-title" className="mt-5 font-serif text-2xl font-semibold">Why this reflection is here</h2><p className="mt-4 text-sm leading-7 text-[#f3e9d2]/65">The language is a reflective interpretation, not a fabricated quotation. The evidence card points back to a governed local record so you can continue to the source context.</p><dl className="mt-7 space-y-4 text-sm"><div className="flex justify-between gap-4 border-b border-white/10 pb-3"><dt className="text-[#f3e9d2]/50">Record</dt><dd className="text-right font-mono text-xs text-[#d7b45a]">{evidence.id}</dd></div><div className="flex justify-between gap-4 border-b border-white/10 pb-3"><dt className="text-[#f3e9d2]/50">Locator</dt><dd className="text-right text-[#f3e9d2]/80">{evidence.locator}</dd></div><div className="flex justify-between gap-4"><dt className="text-[#f3e9d2]/50">Source IDs</dt><dd className="text-right text-[#f3e9d2]/80">{evidence.sourceIds.join(", ")}</dd></div></dl><Link href={localizedPath(language, "/knowledge")} className="mt-8 inline-flex items-center text-sm font-semibold text-[#d7b45a] hover:text-[#f4d98b]">Open the source explorer <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" /></Link></aside>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24" aria-labelledby="chapters-title"><div className="mb-8 flex items-end justify-between gap-5"><div><p className="text-xs uppercase tracking-[.24em] text-[#d7b45a]">The wider path</p><h2 id="chapters-title" className="mt-2 font-serif text-3xl font-semibold">A journey in chapters</h2></div><Link href={localizedPath(language, "/journey")} className="hidden items-center text-sm font-semibold text-[#d7b45a] sm:inline-flex">Open Journey Atlas <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" /></Link></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{["Birth", "Mithila", "Exile", "Forest", "Hanuman", "Lanka", "Return", "Rama Rajya"].map((chapter, index) => <div key={chapter} className="walk-chapter"><span className="text-xs font-mono text-[#d7b45a]/65">0{index + 1}</span><span className="mt-3 font-serif text-lg text-[#f3e9d2]">{chapter}</span><span className="mt-2 text-xs text-[#f3e9d2]/45">Source context</span></div>)}</div><Link href={localizedPath(language, "/journey")} className="mt-6 inline-flex items-center text-sm font-semibold text-[#d7b45a] sm:hidden">Open Journey Atlas <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" /></Link></section>
      </main>
      <RamaFooter />
    </div>
  );
}
