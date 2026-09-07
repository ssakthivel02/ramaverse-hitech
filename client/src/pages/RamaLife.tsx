import React, { useState } from "react";
import { Link } from "wouter";
import { BookOpen, ChevronRight, Compass, ShieldCheck, Sparkles, Users } from "lucide-react";
import { RamaFooter } from "@/components/RamaFooter";
import { RamaNavbar } from "@/components/RamaNavbar";
import { useTranslation } from "@/contexts/MultilingualContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { TraditionClassificationBadge } from "@/components/TraditionClassificationBadge";

type AgeLayer = "ages_2_5" | "ages_6_9" | "ages_10_13" | "teen" | "adult" | "devotee" | "student" | "scholar";
type DepthMode = "quick" | "simple" | "standard" | "deep" | "scholar";

interface AgeMeta {
  code: AgeLayer;
  title: string;
  subtitle: string;
  framing: string;
}

const AGE_LAYERS: AgeMeta[] = [
  { code: "ages_2_5", title: "Ages 2–5", subtitle: "Audio & Parent Mode", framing: "Gentle audio-first narration emphasizing kindness, family warmth, and listening together with parents." },
  { code: "ages_6_9", title: "Ages 6–9", subtitle: "Core Adventures & Values", framing: "Engaging storytelling focused on courage, keeping promises, love for siblings, and helping others." },
  { code: "ages_10_13", title: "Ages 10–13", subtitle: "Kandas & Geography", framing: "Structured epic exploration covering the Seven Kandas, epic travel routes, key characters, and righteous choices." },
  { code: "teen", title: "Teen Explorer", subtitle: "Ethics & Leadership", framing: "Deep dive into moral dilemmas, duty, character development, emotional resilience, and personal responsibility." },
  { code: "adult", title: "Adult Reader", subtitle: "Full Epic & Dharma", framing: "Comprehensive narrative study integrating Valmiki's text, philosophical principles, family duty, and daily reflections." },
  { code: "devotee", title: "Devotee Path", subtitle: "Bhakti & Tradition", framing: "Exploration of Rama Nama, traditional stotras, devotional stanzas, pilgrimage sites, and auspicious observance." },
  { code: "student", title: "Student / Explorer", subtitle: "Textual & Analytical Study", framing: "Systematic examination of epic structures, character networks, geographical waypoints, and narrative milestones." },
  { code: "scholar", title: "Scholar / Researcher", subtitle: "Edition Provenance & Sources", framing: "Strict source-critical examination of Valmiki editions, Sarga locators, manuscript variants, and tradition divergence." },
];

const DEPTH_MODES: { code: DepthMode; label: string; framing: string }[] = [
  { code: "quick", label: "Quick", framing: "One source-bound orientation sentence." },
  { code: "simple", label: "Simple", framing: "Plain-language narrative emphasis." },
  { code: "standard", label: "Standard", framing: "The established narrative summary and themes." },
  { code: "deep", label: "Deep", framing: "Narrative, themes, and careful source context." },
  { code: "scholar", label: "Scholar", framing: "Source locator, tradition boundary, and editorial limits." },
];

interface EpicMilestone {
  stageNumber: number;
  kanda: string;
  title: string;
  summary: string;
  sourceRef: string;
  themes: string[];
}

const EPIC_MILESTONES: EpicMilestone[] = [
  { stageNumber: 1, kanda: "Bala Kanda", title: "Ancestry & Putrakameshti Yajna", summary: "Dasharatha's lineage in the Solar Dynasty and the great sacrifice performed with Sage Rishyashringa, leading to divine blessings.", sourceRef: "Valmiki Ramayana 1.8–1.17", themes: ["Dynasty", "Duty", "Sacrifice"] },
  { stageNumber: 2, kanda: "Bala Kanda", title: "Birth & Childhood in Ayodhya", summary: "The divine birth of Rama, Lakshmana, Bharata, and Shatrughna, bringing supreme joy and righteousness to Kosala.", sourceRef: "Valmiki Ramayana 1.18", themes: ["Birth", "Joy", "Brotherhood"] },
  { stageNumber: 3, kanda: "Bala Kanda", title: "Protection of Vishwamitra's Yajna", summary: "Rama and Lakshmana journey to the forest with Sage Vishwamitra, subduing demons Tataka and Subahu to safeguard sacred rites.", sourceRef: "Valmiki Ramayana 1.19–1.30", themes: ["Courage", "Protection", "Wisdom"] },
  { stageNumber: 4, kanda: "Bala Kanda", title: "Mithila Swayamvara & Marriage", summary: "Breaking of Shiva's mighty bow in Mithila, winning the hand of Sita Devi, and the joyous multi-royal weddings.", sourceRef: "Valmiki Ramayana 1.67–1.77", themes: ["Dharma", "Partnership", "Celebration"] },
  { stageNumber: 5, kanda: "Ayodhya Kanda", title: "Coronation Preparations & Kaikeyi's Boons", summary: "Dasharatha prepares for Rama's coronation as crown prince. Instigated by Manthara, Kaikeyi claims two boons demanding exile.", sourceRef: "Valmiki Ramayana 2.1–2.19", themes: ["Duty", "Trial", "Promises"] },
  { stageNumber: 6, kanda: "Ayodhya Kanda", title: "Departure for Forest Exile", summary: "Accompanied by Sita and Lakshmana, Rama departs Ayodhya in bark garments, drawing deep sorrow from citizens and Dasharatha.", sourceRef: "Valmiki Ramayana 2.30–2.50", themes: ["Sacrifice", "Devotion", "Righteousness"] },
  { stageNumber: 7, kanda: "Aranya Kanda", title: "Forest Hermitages & Panchavati", summary: "Encounters with forest sages, protection of ascetics, and establishing hermitage at Panchavati on the banks of Godavari.", sourceRef: "Valmiki Ramayana 3.1–3.15", themes: ["Solitude", "Protection", "Peace"] },
  { stageNumber: 8, kanda: "Aranya Kanda", title: "Surpanakha, Khara & Abduction of Sita", summary: "Encounter with Surpanakha, defeat of Khara's army, Maricha's golden deer illusion, and Ravana's abduction of Sita.", sourceRef: "Valmiki Ramayana 3.16–3.55", themes: ["Adversity", "Loss", "Endurance"] },
  { stageNumber: 9, kanda: "Kishkindha Kanda", title: "Jatayu, Shabari & Alliance with Sugriva", summary: "Jatayu's noble sacrifice, meeting devoted Shabari, alliance with Sugriva, defeat of Vali, and dispatch of search parties.", sourceRef: "Valmiki Ramayana 3.68–4.44", themes: ["Friendship", "Devotion", "Justice"] },
  { stageNumber: 10, kanda: "Sundara Kanda", title: "Hanuman's Ocean Leap & Lanka Entry", summary: "Hanuman crosses the ocean, encounters Sita in Ashoka Vatika, delivers Rama's ring, and demonstrates supreme devotion.", sourceRef: "Valmiki Ramayana 5.1–5.68", themes: ["Faith", "Courage", "Service"] },
  { stageNumber: 11, kanda: "Yuddha Kanda", title: "Building of Rama Setu & War in Lanka", summary: "Construction of the bridge across the sea, epic battle against Ravana, Kumbhakarna, and Indrajit, and restoration of righteousness.", sourceRef: "Valmiki Ramayana 6.22–6.115", themes: ["Strategy", "Valor", "Victory"] },
  { stageNumber: 12, kanda: "Uttara Kanda", title: "Return to Ayodhya, Pattabhishekam & Rama Rajya", summary: "Return on Pushpaka Vimana, grand coronation in Ayodhya, and the golden era of ideal righteous governance (Rama Rajya).", sourceRef: "Valmiki Ramayana 6.128 & Uttara Kanda", themes: ["Governance", "Harmony", "Eternal Peace"] },
];

export default function RamaLife() {
  const { language, getLanguageMeta } = useTranslation();
  const activeLanguage = getLanguageMeta(language);
  const isContentPriorityLanguage = activeLanguage.contentStatus === "full_content_priority";
  const [activeAge, setActiveAge] = useState<AgeLayer>("adult");
  const [depthMode, setDepthMode] = useState<DepthMode>("standard");
  const { data: characters } = trpc.ramaverse.getCharacters.useQuery();
  const featuredNames = new Set(["Sri Rama", "Sita Devi", "Lakshmana", "Hanuman"]);
  const featuredCharacters = characters?.filter((character) => featuredNames.has(character.name)) ?? [];
  const currentAgeMeta = AGE_LAYERS.find((item) => item.code === activeAge) || AGE_LAYERS[4];
  const currentDepthMeta = DEPTH_MODES.find((item) => item.code === depthMode) || DEPTH_MODES[2];
  const describeMilestone = (milestone: EpicMilestone) => {
    if (depthMode === "quick") return `${milestone.title}: a source-linked stage in ${milestone.kanda}.`;
    if (depthMode === "simple" || activeAge === "ages_2_5") return `A story of ${milestone.title}, told with care, kindness, and its source context.`;
    if (depthMode === "scholar") return `${milestone.summary} Source boundary: ${milestone.sourceRef}; this pathway does not merge later, regional, or editorial material into the Valmiki sequence.`;
    if (depthMode === "deep") return `${milestone.summary} Themes to examine: ${milestone.themes.join(", ")}. Read this alongside the stated source locator and its editorial status.`;
    if (activeAge === "ages_6_9") return `An adventure of courage and keeping promises: ${milestone.summary}`;
    return milestone.summary;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b101b] text-[#f3e9d2]">
      <RamaNavbar />
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-[#d4af37]/20 bg-gradient-to-b from-[#162032] to-[#0b101b] py-20 sm:py-28">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_20%,rgba(212,175,55,0.12),transparent_56%)]" />
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] text-xs font-semibold uppercase tracking-wider mb-5">
              <Compass className="w-3.5 h-3.5" />
              Complete Rama Life Narrative Universe
            </div>
            <h1 className="font-serif text-4xl sm:text-6xl font-bold gold-gradient-text mb-5">Rama Life Journey</h1>
            <p className="text-base sm:text-lg text-[#f3e9d2]/75 leading-relaxed max-w-3xl mx-auto">
              Follow the comprehensive narrative stages across all Seven Kandas with multi-age explanation layers—tailored for learners of every age group.
            </p>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="rounded-2xl border border-[#d4af37]/30 bg-[#162032]/70 p-6 sm:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 border-b border-white/10 pb-5">
              <div>
                <span className="text-xs uppercase tracking-[0.18em] text-[#d4af37] font-semibold">Active Perspective Layer</span>
                <h2 className="font-serif text-2xl font-bold text-[#f3e9d2] mt-1">{currentAgeMeta.title} · {currentAgeMeta.subtitle}</h2>
              </div>
              <TraditionClassificationBadge classification="VERIFIED_CANONICAL" />
            </div>
            <p className="text-sm text-[#f3e9d2]/80 mb-6 leading-relaxed">{currentAgeMeta.framing}</p>
            <div className="flex flex-wrap gap-2">
              {AGE_LAYERS.map((layer) => (
                <Button
                  key={layer.code}
                  variant={activeAge === layer.code ? "default" : "outline"}
                  onClick={() => setActiveAge(layer.code)}
                  className={`text-xs ${activeAge === layer.code ? 'bg-[#d4af37] text-[#0b101b] font-bold' : 'border-[#d4af37]/30 text-[#f3e9d2] hover:bg-[#d4af37]/10'}`}
                >
                  {layer.title}
                </Button>
              ))}
            </div>
            <div className="mt-5 border-t border-white/10 pt-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#d4af37]">Reading depth · {currentDepthMeta.framing}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {DEPTH_MODES.map((mode) => <Button key={mode.code} variant={depthMode === mode.code ? "default" : "outline"} onClick={() => setDepthMode(mode.code)} className={`text-xs ${depthMode === mode.code ? "bg-[#d4af37] text-[#0b101b] font-bold" : "border-[#d4af37]/30 text-[#f3e9d2] hover:bg-[#d4af37]/10"}`}>{mode.label}</Button>)}
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
            <div>
              <div className="flex items-start gap-3 rounded-2xl border border-[#d4af37]/25 bg-[#162032]/60 p-5 mb-10">
                <ShieldCheck className="w-5 h-5 text-[#d4af37] shrink-0 mt-0.5" />
                <div>
                  <h2 className="font-serif text-lg font-bold text-[#f3e9d2]">Source-Grounded Milestone Ledger</h2>
                  <p className="text-sm text-[#f3e9d2]/70 mt-1 leading-relaxed">
                    Each milestone resolves directly to Valmiki Ramayana source locators and Kanda references. No historical dates or unverified traditions are inserted into the primary narrative sequence.
                  </p>
                </div>
              </div>

              <div role="status" className="mb-8 rounded-2xl border border-sky-300/25 bg-sky-300/5 p-5 text-sm leading-relaxed text-[#dceeff]">
                <p className="font-semibold text-sky-100">Canonical-language safeguard · {activeLanguage.nativeLabel} ({activeLanguage.label})</p>
                {isContentPriorityLanguage ? (
                  <p className="mt-1 text-[#dceeff]/80">Tamil and English are content-priority interface languages. Each source passage, editorial summary, and translation remains separately labeled by its actual availability and review state.</p>
                ) : (
                  <p className="mt-1 text-[#dceeff]/80">{activeLanguage.label} is available for the interface at a {activeLanguage.contentStatus.replaceAll("_", " ")} level. This reading path keeps its validated primary form; it does not generate or imply an unreviewed translation.</p>
                )}
              </div>

              <ol className="relative space-y-6 before:absolute before:left-5 before:top-8 before:bottom-8 before:w-px before:bg-[#d4af37]/30">
                {EPIC_MILESTONES.map((m) => (
                  <li key={m.stageNumber} className="relative pl-14">
                    <div className="absolute left-0 top-6 grid h-10 w-10 place-items-center rounded-full border-4 border-[#0b101b] bg-[#d4af37] font-serif font-bold text-[#0b101b] shadow-lg shadow-[#d4af37]/20">
                      {m.stageNumber}
                    </div>
                    <article className="rounded-2xl border border-[#d4af37]/20 bg-[#162032]/55 p-6 sm:p-7 transition-colors hover:border-[#d4af37]/50">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-widest text-[#d4af37]">{m.kanda} · Stage {m.stageNumber}</p>
                          <h2 className="mt-2 font-serif text-2xl font-bold text-[#f3e9d2]">{m.title}</h2>
                        </div>
                        <span className="w-fit rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">{m.sourceRef}</span>
                      </div>
                      <p className="mt-4 text-sm leading-relaxed text-[#f3e9d2]/85">
                        {describeMilestone(m)}
                      </p>
                      <div className="mt-5 flex flex-wrap gap-2">
                        {m.themes.map((theme) => (
                          <span key={theme} className="rounded-full border border-white/10 bg-[#0b101b]/60 px-3 py-1 text-xs text-[#f3e9d2]/75">{theme}</span>
                        ))}
                      </div>
                      <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                        <TraditionClassificationBadge classification="VERIFIED_CANONICAL" />
                        <Link href="/kandas" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#d4af37] no-underline hover:text-[#f3e9d2]">
                          Explore source Kanda <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                        <Link href="/search" className="text-xs text-[#f3e9d2]/60 hover:text-[#d4af37]">Search related verses</Link>
                      </div>
                    </article>
                  </li>
                ))}
              </ol>
            </div>

            <aside className="h-fit rounded-2xl border border-[#d4af37]/20 bg-[#162032]/40 p-6 lg:sticky lg:top-28">
              <Sparkles className="w-6 h-6 text-[#d4af37]" />
              <h2 className="mt-4 font-serif text-xl font-bold text-[#f3e9d2]">Read with care</h2>
              <p className="mt-3 text-sm leading-relaxed text-[#f3e9d2]/70">
                RamaVerse keeps Valmiki, Tamil, devotional, regional, and scholarly traditions distinguishable. An individual claim becomes display-ready only when its source identity and review state are present.
              </p>
              <Link href="/search" className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[#d4af37]/35 px-4 py-3 text-sm font-semibold text-[#d4af37] no-underline hover:bg-[#d4af37]/10">
                <BookOpen className="w-4 h-4" /> Search the corpus
              </Link>

              <div className="mt-8 border-t border-white/10 pt-6">
                <div className="flex items-center gap-2 text-[#d4af37]"><Users className="h-4 w-4" /><h2 className="font-serif text-lg font-bold">Current character discovery</h2></div>
                <p className="mt-2 text-xs leading-relaxed text-[#f3e9d2]/65">These links use only the current character corpus. They are navigation aids, not a new relationship graph or additional genealogical claims.</p>
                <div className="mt-4 space-y-2">
                  {featuredCharacters.map((character) => (
                    <Link key={character.id} href="/characters" className="block rounded-lg border border-white/10 bg-[#0b101b]/40 px-3 py-2 text-sm no-underline transition-colors hover:border-[#d4af37]/35">
                      <span className="font-semibold text-[#f3e9d2]">{character.name}</span>
                      <span className="mt-1 block text-[10px] uppercase tracking-wide text-amber-200">Editorial review: {character.reviewStatus.replaceAll("_", " ")}</span>
                      <span className="mt-1 block text-[10px] text-[#f3e9d2]/55">Relationship evidence is withheld pending source-level review.</span>
                    </Link>
                  ))}
                  {!featuredCharacters.length && <p className="text-xs text-[#f3e9d2]/55">Character discovery is unavailable until the existing corpus is loaded.</p>}
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <RamaFooter />
    </div>
  );
}
