import React from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LANGUAGE_TRANSLATION_STATES, MultilingualProvider, isSupportedLanguage, localizedPath, REQUIRED_UI_KEYS, stripLocalePrefix, SUPPORTED_LANGUAGES, TIER_A_UI_LANGUAGES, useTranslation } from "./MultilingualContext";
import { RamaNavbar } from "@/components/RamaNavbar";
import { ReviewStatusBadge } from "@/components/ReviewStatusBadge";

function LanguageSelectorHarness() {
  const { language, setLanguage, t, getLanguageMeta } = useTranslation();
  const selectedLanguage = getLanguageMeta(language);

  return (
    <>
      <select aria-label="Test language selector" value={language} onChange={(event) => setLanguage(event.target.value as typeof language)}>
        {SUPPORTED_LANGUAGES.map((entry) => <option key={entry.code} value={entry.code}>{entry.nativeLabel}</option>)}
      </select>
      <output aria-live="polite">{t("heroTitle")}</output>
      {selectedLanguage.level !== "A" && <p role="note">{t("contentNotice")}</p>}
    </>
  );
}

const TIER_A_CODES = ["en", "ta", "hi", "te", "kn", "ml"] as const;

type TierACode = (typeof TIER_A_CODES)[number];

function TierAProbe() {
  const { language, t } = useTranslation();
  return <output data-testid="tier-a-probe">{JSON.stringify({ language, home: t("navHome"), source: t("sourceLanguage"), fallback: t("contentFallback") })}</output>;
}

function KeyProbe() {
  const { t } = useTranslation();
  return <output data-testid="key-probe">{JSON.stringify(REQUIRED_UI_KEYS.filter((key) => t(key) === key))}</output>;
}

describe("RamaVerse multilingual language registry", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.lang = "en";
    document.documentElement.dir = "ltr";
  });

  afterEach(() => {
    cleanup();
  });
  it("registers the supported interface languages with explicit rollout levels", () => {
    expect(SUPPORTED_LANGUAGES).toHaveLength(30);
    expect(SUPPORTED_LANGUAGES.map((language) => language.code)).toContain("zh-CN");
    expect(SUPPORTED_LANGUAGES.map((language) => language.code)).toEqual(expect.arrayContaining(["ur", "ms"]));
    expect(SUPPORTED_LANGUAGES.filter((language) => language.level === "A").map((language) => language.code)).toEqual(["en", "ta", "hi", "te", "kn", "ml"]);
    expect(SUPPORTED_LANGUAGES.every((language) => language.fallbackLanguage === "en" || language.fallbackLanguage === "ta")).toBe(true);
  });

  it("exposes explicit UI/content translation truth for every registered language", () => {
    expect(Object.keys(LANGUAGE_TRANSLATION_STATES)).toHaveLength(SUPPORTED_LANGUAGES.length);
    expect(LANGUAGE_TRANSLATION_STATES.en).toEqual({ ui: "UI_COMPLETE", content: "CONTENT_PARTIAL" });
    expect(LANGUAGE_TRANSLATION_STATES.ta).toEqual({ ui: "UI_COMPLETE", content: "CONTENT_PARTIAL" });
    expect(LANGUAGE_TRANSLATION_STATES.hi).toEqual({ ui: "UI_COMPLETE", content: "CONTENT_PARTIAL" });
    expect(LANGUAGE_TRANSLATION_STATES.te).toEqual({ ui: "UI_COMPLETE", content: "CONTENT_PARTIAL" });
    expect(LANGUAGE_TRANSLATION_STATES.kn).toEqual({ ui: "UI_COMPLETE", content: "CONTENT_PARTIAL" });
    expect(LANGUAGE_TRANSLATION_STATES.ml).toEqual({ ui: "UI_COMPLETE", content: "CONTENT_PARTIAL" });
    expect(LANGUAGE_TRANSLATION_STATES.ur).toEqual({ ui: "UI_PARTIAL", content: "CONTENT_PENDING" });
  });

  it("accepts only registered language codes for persisted state", () => {
    expect(isSupportedLanguage("ta")).toBe(true);
    expect(isSupportedLanguage("fr")).toBe(true);
    expect(isSupportedLanguage("unsupported-language")).toBe(false);
    expect(isSupportedLanguage(null)).toBe(false);
  });

  it("updates visible interface text, document language, and persisted state after selection", async () => {
    const user = userEvent.setup();
    render(<MultilingualProvider><LanguageSelectorHarness /></MultilingualProvider>);

    await user.selectOptions(screen.getByLabelText("Test language selector"), "ta");

    expect(screen.getByRole("status").textContent).toContain("நித்திய ராமவெர்ஸை ஆராயுங்கள்");
    expect(document.documentElement.lang).toBe("ta");
    expect(localStorage.getItem("ramaverse_lang")).toBe("ta");
  });

  it("does not show a controlled-expansion fallback notice for a Tier A interface language", async () => {
    const user = userEvent.setup();
    render(<MultilingualProvider><LanguageSelectorHarness /></MultilingualProvider>);

    await user.selectOptions(screen.getByLabelText("Test language selector"), "hi");

    expect(screen.queryByRole("note")).toBeNull();
    expect(document.documentElement.lang).toBe("hi");
    expect(localStorage.getItem("ramaverse_lang")).toBe("hi");
  });

  it("sets a right-to-left document direction for registered RTL framework languages", async () => {
    const user = userEvent.setup();
    render(<MultilingualProvider><LanguageSelectorHarness /></MultilingualProvider>);

    await user.selectOptions(screen.getByLabelText("Test language selector"), "ur");

    expect(document.documentElement.lang).toBe("ur");
    expect(document.documentElement.dir).toBe("rtl");
    expect(localStorage.getItem("ramaverse_lang")).toBe("ur");
  });

  it("keeps desktop and mobile navigation selectors synchronized through the shared provider", async () => {
    const user = userEvent.setup();
    render(<MultilingualProvider><RamaNavbar /></MultilingualProvider>);

    await user.click(screen.getByLabelText("View / Change language"));
    await user.type(screen.getByTestId("desktop-language-search"), "Hindi");
    await user.click(screen.getByRole("option", { name: /Hindi/i }));
    await user.click(screen.getByTestId("mobile-nav-toggle"));

    const mobileSelector = screen.getByTestId("mobile-language-selector");
    expect(mobileSelector.textContent).toContain("हिन्दी");

    await user.click(screen.getByTestId("mobile-language-toggle"));
    await user.type(screen.getByTestId("mobile-language-search"), "Tamil");
    await user.click(screen.getByRole("option", { name: /Tamil/i }));
    expect(screen.getByTestId("desktop-language-selector").textContent).toContain("தமிழ்");
    expect(localStorage.getItem("ramaverse_lang")).toBe("ta");
  });

  it("renders every Tier A interface in its own script and keeps UI/content state separate", async () => {
    const user = userEvent.setup();
    const expectedHome: Record<TierACode, string> = { en: "Home", ta: "முகப்பு", hi: "मुखपृष्ठ", te: "హోమ్", kn: "ಮುಖಪುಟ", ml: "ഹോം" };
    render(<MultilingualProvider><LanguageSelectorHarness /><TierAProbe /></MultilingualProvider>);
    const selector = screen.getByLabelText("Test language selector");

    for (const code of TIER_A_CODES) {
      await user.selectOptions(selector, code);
      const probe = JSON.parse(screen.getByTestId("tier-a-probe").textContent ?? "{}");
      expect(probe.language).toBe(code);
      expect(probe.home).toBe(expectedHome[code]);
      expect(probe.source).not.toBe(probe.fallback);
      expect(document.documentElement.lang).toBe(code);
    }
  });

  it("normalizes locale-prefixed routes without changing the underlying route", () => {
    for (const code of TIER_A_CODES) {
      expect(localizedPath(code, "/search")).toBe(`/${code}/search`);
      expect(stripLocalePrefix(`/${code}/search`)).toEqual({ language: code, path: "/search" });
    }
    expect(stripLocalePrefix("/search")).toEqual({ language: null, path: "/search" });
  });

  it("provides every required UI key without key-name fallbacks for Tier A languages", async () => {
    const user = userEvent.setup();
    render(<MultilingualProvider><LanguageSelectorHarness /></MultilingualProvider>);
    const selector = screen.getByLabelText("Test language selector");
    for (const code of TIER_A_CODES) {
      await user.selectOptions(selector, code);
      render(<MultilingualProvider><KeyProbe /></MultilingualProvider>);
      expect(JSON.parse(screen.getByTestId("key-probe").textContent ?? "[]")).toEqual([]);
      cleanup();
      render(<MultilingualProvider><LanguageSelectorHarness /></MultilingualProvider>);
    }
  });

  it("renders a visible source-review disclosure for template-derived records", () => {
    render(<ReviewStatusBadge reviewStatus="needs_source_review" />);

    expect(screen.getByText(/Editorial review: needs source review/i)).toBeDefined();
  });
});
