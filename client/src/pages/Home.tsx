import { Button } from "@/components/ui/button";
import { RamaNavbar } from "@/components/RamaNavbar";
import { RamaFooter } from "@/components/RamaFooter";
import { FadeReveal, JourneyPath, SacredGlow } from "@/components/motion/MotionPrimitives";
import { localizedPath, useTranslation } from "@/contexts/MultilingualContext";
import { ArrowRight, Award, BookOpen, Bookmark, Compass, Globe2, Headphones, HeartHandshake, MapPin, MessageSquare, Search, ShieldCheck, Smile, Sparkles, Users } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { t, language, getLanguageMeta } = useTranslation();
  const langMeta = getLanguageMeta(language);

  const modules = [
    { title: t("navKandas"), desc: t("kandaIntro"), href: "/kandas", icon: BookOpen, count: `7 · ${t("booksOfRamayana")}`, tone: "gold" },
    { title: t("navWisdom"), desc: t("searchSubtitle"), href: "/wisdom", icon: Sparkles, count: `108 · ${t("wisdomRecords")}`, tone: "blue" },
    { title: t("characters"), desc: t("footerSummary"), href: "/characters", icon: Users, count: `51 · ${t("characters")}`, tone: "mint" },
    { title: t("sacredPlaces"), desc: t("footerSummary"), href: "/places", icon: MapPin, count: `25 · ${t("sacredPlaces")}`, tone: "saffron" },
    { title: t("navGuidance"), desc: t("contentFallback"), href: "/guidance", icon: HeartHandshake, count: `100 · ${t("guidanceRecords")}`, tone: "gold" },
    { title: t("navStories"), desc: t("contentFallback"), href: "/stories", icon: Smile, count: `30 · ${t("kidsStories")}`, tone: "blue" },
    { title: t("navQuizzes"), desc: t("contentFallback"), href: "/quizzes", icon: Award, count: `100 · ${t("quizzes")}`, tone: "mint" },
    { title: t("navAudio"), desc: t("contentFallback"), href: "/audio", icon: Headphones, count: `30 · ${t("audioScripts")}`, tone: "saffron" },
  ];

  const stats = [
    ["7", t("statsKandas")],
    ["108", t("statsWisdom")],
    ["51", t("statsCharacters")],
    ["25", t("statsPlaces")],
  ];

  return (
    <div className="rv-shell min-h-screen bg-[#070b14] text-[#f3e9d2] selection:bg-[#d7b45a] selection:text-[#070b14]">
      <RamaNavbar />
      <main>
        <section className="rv-hero" aria-labelledby="hero-title">
          <div className="rv-hero-grid" />
          <div className="rv-temple-line" />
          <div className="rv-orbit" aria-hidden="true"><span /><span /><span /><span /></div>
          <div className="rv-hero-content">
            <FadeReveal className="max-w-4xl" delay={40}>
              <div className="rv-eyebrow"><ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> {t("sourceGovernedBadge")}</div>
              {langMeta.code !== "en" && langMeta.code !== "ta" && (
                <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[#d7b45a]/25 bg-[#d7b45a]/[0.06] px-3 py-2 text-xs text-[#f3e9d2]/75" role="status">
                  <Globe2 className="h-4 w-4 shrink-0 text-[#d7b45a]" aria-hidden="true" />
                  <span>{t("contentNotice")}</span>
                </div>
              )}
              <p className="rv-kicker mt-8">RAMA · RĀMA · ராம</p>
              <h1 id="hero-title" className="rv-hero-title gold-gradient-text">{t("heroTitle")}</h1>
              <p className="rv-hero-subtitle">{t("heroSubtitle")}</p>
              <div className="rv-hero-actions">
                <Link href={localizedPath(language, "/kandas")}>
                  <Button className="h-12 rounded-full bg-[#d7b45a] px-6 font-semibold text-[#070b14] shadow-[0_0_2rem_rgba(215,180,90,.18)] transition-transform hover:bg-[#f4d98b] active:scale-[.98]">
                    {t("exploreKandas")} <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                  </Button>
                </Link>
                <Link href={localizedPath(language, "/search")}>
                  <Button variant="outline" className="h-12 rounded-full border-[#d7b45a]/40 bg-transparent px-6 text-[#f3e9d2] transition-colors hover:bg-[#d7b45a]/10 active:scale-[.98]">
                    <Search className="mr-2 h-4 w-4 text-[#d7b45a]" aria-hidden="true" /> {t("guidedSearch")}
                  </Button>
                </Link>
                <Link href={localizedPath(language, "/walk-with-rama")} className="inline-flex h-12 items-center rounded-full border border-[#6ea4c5]/35 bg-[#6ea4c5]/[0.06] px-5 text-sm font-semibold text-[#d9edf5] transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4d98b]">
                  <Compass className="mr-2 h-4 w-4 text-[#9bc9dd]" aria-hidden="true" /> Walk with Rama
                </Link>
              </div>
              <div className="mt-8 flex items-center gap-3 text-xs text-[#f3e9d2]/55"><JourneyPath /><span>{t("sourceThreadCaption")}</span></div>
            </FadeReveal>

            <FadeReveal className="rv-glass mt-10 max-w-3xl rounded-2xl p-4 sm:p-5" delay={180}>
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#f3e9d2]/62">
                <span className="uppercase tracking-[.16em] text-[#d7b45a]">{t("brandTagline")}</span>
                <span className="h-1 w-1 rounded-full bg-[#d7b45a]/55" aria-hidden="true" />
                <span>{t("canonicalFirst")}</span>
                <span className="h-1 w-1 rounded-full bg-[#d7b45a]/55" aria-hidden="true" />
                <span>{t("offlineFriendly")}</span>
              </div>
              <div className="rv-stat-rail">
                {stats.map(([value, label]) => <div className="rv-stat" key={label}><span className="rv-stat-value">{value}</span><span className="rv-stat-label">{label}</span></div>)}
              </div>
            </FadeReveal>
          </div>
        </section>

        <section className="rv-section mx-auto max-w-7xl" aria-labelledby="modules-title">
          <div className="rv-section-heading">
            <div><p className="mb-2 text-xs uppercase tracking-[.18em] text-[#d7b45a]">{t("exploreKnowledgeUniverse")}</p><h2 id="modules-title" className="font-serif text-3xl font-semibold text-[#f3e9d2] sm:text-4xl">{t("modulesTitle")}</h2></div>
            <p className="hidden text-sm md:block">{t("modulesSubtitle")}</p>
          </div>
          <p className="mb-6 max-w-xl text-sm leading-7 text-[#f3e9d2]/62 md:hidden">{t("modulesSubtitle")}</p>
          <div className="rv-module-grid">
            {modules.map((m, index) => { const Icon = m.icon; return <FadeReveal key={m.href} delay={index * 45}>
              <Link href={localizedPath(language, m.href)} className="group block h-full no-underline">
                <article className="rv-module-card rv-glass h-full" data-tone={m.tone}>
                  <div className="mb-8 flex items-start justify-between gap-3"><SacredGlow><div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#d7b45a]/25 bg-[#d7b45a]/10 text-[#d7b45a] transition-transform duration-200 group-hover:scale-105"><Icon className="h-5 w-5" aria-hidden="true" /></div></SacredGlow><span className="rounded-full border border-[#d7b45a]/20 bg-[#d7b45a]/[0.06] px-2 py-1 text-[10px] font-semibold text-[#d7b45a]">{m.count}</span></div>
                  <h3 className="mb-2 font-serif text-lg font-semibold text-[#f3e9d2] transition-colors group-hover:text-[#f4d98b]">{m.title}</h3><p className="mb-5 text-xs leading-6">{m.desc}</p>
                  <span className="flex items-center gap-1.5 border-t border-white/10 pt-3 text-xs font-semibold text-[#d7b45a]">{t("exploreModule")} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" /></span>
                </article>
              </Link>
            </FadeReveal>; })}
          </div>
        </section>

        <section className="border-y border-[#d7b45a]/15 bg-[#0d1524]/55" aria-labelledby="tools-title">
          <div className="rv-section mx-auto max-w-7xl"><div className="rv-section-heading"><div><p className="mb-2 text-xs uppercase tracking-[.18em] text-[#d7b45a]">{t("followTheThread")}</p><h2 id="tools-title" className="font-serif text-3xl font-semibold">{t("goDeeperGently")}</h2></div><p className="hidden text-sm md:block">{t("sourceConsciousDescription")}</p></div>
            <div className="grid gap-4 md:grid-cols-3">
              {[{href:"/journey",icon:Compass,title:`${t("journeyLabel")} Atlas`,body:t("kandaIntro"),cta:t("openAtlas")},{href:"/ask",icon:MessageSquare,title:t("askAssistant"),body:t("searchSubtitle"),cta:t("navAsk")},{href:"/library",icon:Bookmark,title:t("libraryLabel"),body:t("footerSummary"),cta:t("openLibrary")}].map(({href,icon:Icon,title,body,cta})=><Link key={href} href={localizedPath(language,href)} className="group no-underline"><article className="rv-glass rounded-2xl p-6 transition-transform duration-200 hover:-translate-y-1"><Icon className="mb-5 h-7 w-7 text-[#d7b45a]" aria-hidden="true"/><h3 className="font-serif text-xl font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-[#f3e9d2]/62">{body}</p><span className="mt-5 flex items-center text-xs font-semibold text-[#d7b45a]">{cta}<ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true"/></span></article></Link>)}
            </div>
          </div>
        </section>
      </main>
      <RamaFooter />
    </div>
  );
}
