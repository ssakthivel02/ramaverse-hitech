import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, Globe2, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import {
  LANGUAGE_TRANSLATION_STATES,
  SUPPORTED_LANGUAGES,
  SupportedLanguage,
  localizedPath,
  stripLocalePrefix,
  translationStatusKey,
  useTranslation,
} from "@/contexts/MultilingualContext";

function statusLabel(status: string, t: (key: string) => string) {
  return t(translationStatusKey(status));
}

export function LanguageSelector({ mobile = false }: { mobile?: boolean }) {
  const { language, setLanguage, t, getLanguageMeta } = useTranslation();
  const [location, navigate] = useLocation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selected = getLanguageMeta(language);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const titleId = useId();
  const searchId = useId();
  const listId = useId();
  const languageState = LANGUAGE_TRANSLATION_STATES[language];

  const results = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized) return SUPPORTED_LANGUAGES;
    return SUPPORTED_LANGUAGES.filter((item) =>
      `${item.label} ${item.nativeLabel} ${item.code}`.toLocaleLowerCase().includes(normalized),
    );
  }, [query]);

  const close = (restoreFocus = true) => {
    setOpen(false);
    setQuery("");
    if (restoreFocus) window.requestAnimationFrame(() => triggerRef.current?.focus());
  };

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const focusTimer = window.requestAnimationFrame(() => inputRef.current?.focus());
    const onPointerDown = (event: PointerEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node) && !triggerRef.current?.contains(event.target as Node)) {
        close(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>("button, input, [tabindex]:not([tabindex='-1'])")).filter((node) => !node.hasAttribute("disabled"));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(focusTimer);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      if (!open && previouslyFocused) previouslyFocused.focus();
    };
  }, [open]);

  const choose = (code: SupportedLanguage) => {
    setLanguage(code);
    const currentPath = stripLocalePrefix(location).path;
    navigate(localizedPath(code, currentPath));
    close();
  };

  return (
    <div data-testid={mobile ? "mobile-language-selector" : "desktop-language-selector"} className={`relative script-safe ${mobile ? "w-full" : "w-auto"}`}>
      <Button
        ref={triggerRef}
        type="button"
        variant="outline"
            data-testid={mobile ? "mobile-language-toggle" : "desktop-language-toggle"}
        aria-label={mobile ? `${t("langChange")} ${t("inNavigation")}` : t("langChange")}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        title={t("langChange")}
        onClick={() => setOpen((value) => !value)}
        className={`${mobile ? "w-full justify-between" : "w-[7.25rem] min-w-0 justify-between sm:w-auto sm:min-w-[13rem]"} min-h-11 script-safe border-[#d4af37]/55 bg-[#162032] px-2 sm:px-3 text-left text-[10px] text-[#f3e9d2] shadow-[0_8px_24px_rgba(0,0,0,0.16)] transition hover:border-[#d4af37] hover:bg-[#d4af37]/10 hover:text-[#f3e9d2] focus-visible:ring-2 focus-visible:ring-[#f3e9d2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b101b] sm:text-xs`}
      >
        <span className="flex min-w-0 items-center gap-2">
          <Globe2 aria-hidden="true" className="h-4 w-4 shrink-0 text-[#d4af37]" />
          <span className="min-w-0 leading-tight">
            <span className="block max-w-[6.5rem] whitespace-normal font-semibold leading-tight">{t("langChange")}</span>
            <span className="mt-0.5 hidden truncate text-[10px] text-[#f3e9d2]/65 sm:block">{selected.nativeLabel} · {selected.label}</span>
          </span>
        </span>
        <span className="ml-2 hidden shrink-0 text-[9px] uppercase tracking-[0.08em] text-[#d4af37] sm:block">{statusLabel(languageState.ui, t)}</span>
      </Button>

      {open && (
        <div
          ref={dialogRef}
          id={listId}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className={`${mobile ? "relative mt-2 w-full" : "absolute right-0 top-full mt-2"} script-safe z-[70] w-[min(92vw,27rem)] rounded-xl border border-[#d4af37]/45 bg-[#101a2a] p-4 text-[#f3e9d2] shadow-2xl shadow-black/40`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p id={titleId} className="text-sm font-semibold text-[#f3e9d2]">{t("langChange")}</p>
              <p className="mt-1 text-xs text-[#f3e9d2]/65">{t("langCurrent")}: <span className="font-semibold text-[#d4af37]">{selected.nativeLabel} · {selected.label}</span></p>
            </div>
            <button type="button" aria-label={t("langClose")} onClick={() => close()} className="rounded-md p-1.5 text-[#f3e9d2]/70 transition hover:bg-white/10 hover:text-[#f3e9d2] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]">
              <X aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>

          <label className="sr-only" htmlFor={searchId}>{t("langSearch")}</label>
          <div className="relative mt-4">
            <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-[#d4af37]" />
            <Input data-testid={mobile ? "mobile-language-search" : "desktop-language-search"} ref={inputRef} id={searchId} value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("langSearch")} autoComplete="off" className="min-h-11 border-[#d4af37]/35 bg-[#0b101b] pl-9 pr-3 text-[#f3e9d2] placeholder:text-[#f3e9d2]/45 focus-visible:ring-[#d4af37]" />
          </div>

          <p className="mt-3 rounded-lg border border-[#d4af37]/15 bg-[#d4af37]/5 p-2.5 text-[11px] leading-relaxed text-[#f3e9d2]/70" role="note">
            {t("uiContentSeparate")}
          </p>

          <div className="mt-3 max-h-[min(55vh,24rem)] space-y-1 overflow-y-auto pr-1" role="listbox" aria-label={t("langList")}>
            {results.map((item) => {
              const itemState = LANGUAGE_TRANSLATION_STATES[item.code];
              return (
                <button
                  key={item.code}
                  type="button"
                  role="option"
                  aria-selected={language === item.code}
                  onClick={() => choose(item.code)}
                  style={{ minWidth: 0, overflowWrap: "anywhere", lineHeight: 1.5 }}
                  className="script-safe flex min-h-12 w-full items-center gap-3 rounded-lg border border-transparent px-3 py-2 text-left leading-relaxed transition-colors hover:border-[#d4af37]/35 hover:bg-[#d4af37]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]/80"
                >
                  <span className="script-safe flex min-w-0 flex-1 flex-col">
                    <span className="script-safe flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm font-semibold"><span>{item.nativeLabel}</span><span className="font-normal text-[#f3e9d2]/60">— {item.label}</span></span>
                    <span className="mt-1 flex flex-wrap gap-1.5 text-[9px] uppercase tracking-[0.08em]"><span className="rounded bg-[#d4af37]/10 px-1.5 py-0.5 text-[#d4af37]">{statusLabel(itemState.ui, t)}</span><span className="rounded bg-white/5 px-1.5 py-0.5 text-[#f3e9d2]/65">{statusLabel(itemState.content, t)}</span></span>
                  </span>
                  {language === item.code && <Check aria-hidden="true" className="h-4 w-4 shrink-0 text-emerald-300" />}
                </button>
              );
            })}
            {!results.length && <p className="rounded-lg border border-dashed border-[#d4af37]/25 p-3 text-xs text-[#f3e9d2]/65">{t("langNoMatch")}</p>}
          </div>
          <p className="mt-3 text-[10px] text-[#f3e9d2]/50">{t("langEscape")} {t("langSaved")}</p>
        </div>
      )}
    </div>
  );
}

export default LanguageSelector;

// Keep the translation status surface explicit for report generation and runtime inspection.
export const languageSelectorStatusLabels = ["UI_COMPLETE", "UI_PARTIAL", "CONTENT_COMPLETE", "CONTENT_PARTIAL", "CONTENT_PENDING"] as const;
