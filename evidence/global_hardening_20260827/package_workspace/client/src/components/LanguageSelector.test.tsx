import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const { setLanguage, translationStates } = vi.hoisted(() => ({
  setLanguage: vi.fn(),
  translationStates: {
    en: { ui: "UI_COMPLETE", content: "CONTENT_PARTIAL" },
    ta: { ui: "UI_COMPLETE", content: "CONTENT_PARTIAL" },
    ur: { ui: "UI_PARTIAL", content: "CONTENT_PENDING" },
  },
}));
vi.mock("@/contexts/MultilingualContext", () => ({
  LANGUAGE_TRANSLATION_STATES: translationStates,
  SUPPORTED_LANGUAGES: [
    { code: "en", label: "English", nativeLabel: "English", uiStatus: "full_ui", contentStatus: "full_content_priority" },
    { code: "ta", label: "Tamil", nativeLabel: "தமிழ்", uiStatus: "full_ui", contentStatus: "full_content_priority" },
    { code: "ur", label: "Urdu", nativeLabel: "اردو", uiStatus: "framework", contentStatus: "framework" },
  ],
  localizedPath: (language: string, path: string) => `/${language}${path === "/" ? "" : path}`,
  stripLocalePrefix: (path: string) => ({ language: null, path }),
  translationStatusKey: (status: string) => status === "UI_COMPLETE" ? "uiComplete" : status === "CONTENT_PARTIAL" ? "contentPartial" : "contentPending",
  useTranslation: () => ({ language: "en", setLanguage, getLanguageMeta: () => ({ code: "en", label: "English", nativeLabel: "English", uiStatus: "full_ui", contentStatus: "full_content_priority" }), t: (key: string) => ({ langChange: "View / Change language", inNavigation: "in navigation menu", langCurrent: "Current language", langSearch: "Search interface languages", langClose: "Close language selector", langList: "Available interface languages", langNoMatch: "No interface language matches this search.", langEscape: "Press Escape to close.", langSaved: "Your choice is saved on this device.", uiContentSeparate: "UI language and corpus availability are separate.", uiComplete: "UI COMPLETE", uiPartial: "UI PARTIAL", contentPartial: "CONTENT PARTIAL", contentPending: "CONTENT PENDING" }[key] ?? key) }),
}));

import { LanguageSelector } from "./LanguageSelector";

describe("LanguageSelector", () => {
  afterEach(() => { cleanup(); setLanguage.mockReset(); });

  it("searches native and English names while disclosing UI and content availability", async () => {
    const user = userEvent.setup();
    render(<LanguageSelector />);
    await user.click(screen.getByLabelText("View / Change language"));
    expect(screen.getByRole("dialog").className).toContain("script-safe");
    const tamilOption = screen.getByRole("option", { name: /Tamil/i });
    expect(tamilOption.className).toContain("script-safe");
    expect(tamilOption.style.minWidth).toBe("0px");
    expect(tamilOption.style.overflowWrap).toBe("anywhere");
    expect(tamilOption.style.lineHeight).toBe("1.5");
    expect(screen.getAllByText("UI COMPLETE").length).toBeGreaterThan(0);
    expect(screen.getAllByText("CONTENT PARTIAL").length).toBeGreaterThan(0);
    expect(screen.getByText(/Current language:/i)).toBeDefined();
    await user.type(screen.getByLabelText(/Search interface languages/i), "Tamil");
    expect(screen.getByText("தமிழ்")).toBeDefined();
    await user.click(screen.getByRole("option", { name: /Tamil/i }));
    expect(setLanguage).toHaveBeenCalledWith("ta");
  });
});
