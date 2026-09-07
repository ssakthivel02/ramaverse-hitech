import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Sparkles, BookOpen, Users, MapPin, HeartHandshake, Smile, Award, Headphones, Search, Menu, X, MessageSquare, Bookmark, Compass, Clock, Share2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { localizedPath, stripLocalePrefix, useTranslation } from "@/contexts/MultilingualContext";
import { LanguageSelector } from "@/components/LanguageSelector";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function RamaNavbar() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, t, getLanguageMeta } = useTranslation();
  const selectedLanguage = getLanguageMeta(language);
  const currentPath = stripLocalePrefix(location).path;

  const exploreLinks = [
    { href: "/kandas", label: t("navKandas"), icon: BookOpen },
    { href: "/characters", label: t("characters"), icon: Users },
    { href: "/places", label: t("sacredPlaces"), icon: MapPin },
    { href: "/timeline", label: t("navJourney"), icon: Clock },
    { href: "/knowledge", label: t("knowledgeGraph"), icon: Share2 },
    { href: "/guidance", label: t("navGuidance"), icon: HeartHandshake },
    { href: "/stories", label: t("navStories"), icon: Smile },
    { href: "/quizzes", label: t("navQuizzes"), icon: Award },
    { href: "/audio", label: t("navAudio"), icon: Headphones },
  ];

  const mainLinks = [
    { href: "/", label: t("navHome"), icon: BookOpen },
    { href: "/rama-life", label: t("navRamaLife"), icon: Compass },
    { href: "/journey", label: t("navJourney"), icon: Compass },
    { href: "/wisdom", label: t("navWisdom"), icon: Sparkles },
    { href: "/ask", label: t("navAsk"), icon: MessageSquare },
    { href: "/intelligence", label: t("navAsk"), icon: Sparkles },
    { href: "/library", label: t("navLibrary"), icon: Bookmark },
    { href: "/search", label: t("navSearch"), icon: Search },
  ];

  return (
    <header className="rv-header sticky top-0 z-50 border-b border-[#d4af37]/20 bg-[#070b14]/90 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-2">
          <Link href={localizedPath(language, "/")} className="flex min-w-0 shrink items-center gap-2 cursor-pointer group no-underline sm:gap-3">
            <div className="rv-brand-mark h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-[#f4d98b] via-[#d7b45a] to-[#b45309] flex items-center justify-center text-[#070b14] font-bold text-base shadow-lg shadow-[#d7b45a]/20 transition-transform group-hover:scale-105 sm:h-10 sm:w-10 sm:text-xl">
              ॐ
            </div>
            <div>
              <span className="block truncate font-serif text-xl font-bold tracking-wider gold-gradient-text sm:text-2xl">RAMAVERSE</span>
              <span className="block truncate text-[9px] uppercase tracking-[0.12em] text-[#d4af37]/80 sm:text-[10px] sm:tracking-widest">{t("brandTagline")}</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link aria-current={currentPath === '/' ? 'page' : undefined} href={localizedPath(language, "/")} className={`px-3 py-2 rounded-lg text-xs font-medium transition-all no-underline ${currentPath === '/' ? 'text-[#d4af37] bg-[#d4af37]/10 border border-[#d4af37]/30' : 'text-[#f3e9d2]/80 hover:text-[#f3e9d2]'}`}>
              {t("homeLabel")}
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium text-[#f3e9d2]/80 hover:text-[#f3e9d2] outline-none cursor-pointer">
                  {t("navExplore")} <ChevronDown className="w-3 h-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#162032] border-[#d4af37]/30 text-[#f3e9d2] grid grid-cols-2 gap-1 p-2 w-80">
                {exploreLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem key={item.href} asChild className="focus:bg-[#d4af37]/20 focus:text-[#d4af37] cursor-pointer">
                      <Link href={localizedPath(language, item.href)} className="flex items-center gap-2 p-2 rounded-md no-underline text-[#f3e9d2]">
                        <Icon className="w-3.5 h-3.5 text-[#d4af37]" />
                        <span className="text-xs">{item.label}</span>
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {mainLinks.slice(1).map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.href;
              return (
                <Link key={item.href} aria-current={isActive ? 'page' : undefined} href={localizedPath(language, item.href)} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all no-underline ${isActive ? 'bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40' : 'text-[#f3e9d2]/80 hover:text-[#f3e9d2] hover:bg-white/5'}`}>
                  <Icon className="w-3.5 h-3.5 text-[#d4af37]" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <LanguageSelector />
            {/* Mobile menu button */}
            <div className="flex lg:hidden">
              <Button data-testid="mobile-nav-toggle" aria-label={mobileMenuOpen ? t("closeMenu") : t("openMenu")} variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-[#d4af37]">
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#162032] border-b border-[#d4af37]/30 px-4 pt-2 pb-6 space-y-2 max-h-[80vh] overflow-y-auto">
          <div className="py-3 px-2 border-b border-white/10 mb-2"><LanguageSelector mobile /></div>
          <p className="text-[10px] uppercase tracking-widest text-[#d4af37] px-4 py-2 font-bold opacity-60">{t("navPrimary")}</p>
          {mainLinks.map((item) => (
            <Link key={item.href} href={localizedPath(language, item.href)} onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all no-underline ${currentPath === item.href ? 'bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40' : 'text-[#f3e9d2]/80 hover:text-[#f3e9d2]'}`}>
              <item.icon className="w-4 h-4 text-[#d4af37]" />
              {item.label}
            </Link>
          ))}
          <p className="text-[10px] uppercase tracking-widest text-[#d4af37] px-4 py-2 font-bold opacity-60 mt-4">{t("navExploreSection")}</p>
          {exploreLinks.map((item) => (
            <Link key={item.href} href={localizedPath(language, item.href)} onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all no-underline ${currentPath === item.href ? 'bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40' : 'text-[#f3e9d2]/80 hover:text-[#f3e9d2]'}`}>
              <item.icon className="w-4 h-4 text-[#d4af37]" />
              {item.label}
            </Link>
          ))}
        </div>
      )}
      {selectedLanguage.level !== "A" && (
        <div role="status" aria-live="polite" className="border-t border-[#d4af37]/15 bg-[#162032]/95 px-4 py-2 text-center text-xs text-[#f3e9d2]/75">
          <span className="font-medium text-[#d4af37]">{selectedLanguage.nativeLabel}:</span> {t("contentNotice")}
        </div>
      )}
    </header>
  );
}
