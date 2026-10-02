import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MultilingualProvider, useTranslation } from "./MultilingualContext";

function Probe() {
  const { language, setLanguage, t } = useTranslation();
  return <>
    <button onClick={() => setLanguage("ar")}>Arabic</button>
    <button onClick={() => setLanguage("ur")}>Urdu</button>
    <button onClick={() => setLanguage("ta")}>Tamil</button>
    <output data-testid="language">{language}</output>
    <output data-testid="title">{t("heroTitle")}</output>
  </>;
}
function blockWrites() {
  const original = Storage.prototype.setItem;
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(function(this: Storage, key: string, value: string) {
    if (key === "ramaverse_lang") throw new DOMException("Blocked", "QuotaExceededError");
    original.call(this, key, value);
  });
  vi.spyOn(console, "error").mockImplementation(() => {});
}

describe("Language accessibility is independent of preference persistence", () => {
  afterEach(() => {
    cleanup(); vi.restoreAllMocks(); localStorage.clear();
    document.documentElement.lang = "en"; document.documentElement.dir = "ltr";
  });

  it("applies a saved Tamil locale even when its persistence write is rejected", () => {
    localStorage.setItem("ramaverse_lang", "ta");
    blockWrites();
    render(<MultilingualProvider><Probe /></MultilingualProvider>);
    expect(screen.getByTestId("language").textContent).toBe("ta");
    expect(document.documentElement.lang).toBe("ta");
    expect(document.documentElement.dir).toBe("ltr");
    expect(screen.getByTestId("title").textContent).toBe("நித்திய ராமவெர்ஸை ஆராயுங்கள்");
    expect(localStorage.getItem("ramaverse_lang")).toBe("ta");
  });

  it.each(["Arabic", "Urdu"] as const)("updates %s language and RTL direction during rejected writes", label => {
    localStorage.setItem("ramaverse_lang", "en");
    blockWrites();
    render(<MultilingualProvider><Probe /></MultilingualProvider>);
    fireEvent.click(screen.getByRole("button", { name: label }));
    const language = label === "Arabic" ? "ar" : "ur";
    expect(screen.getByTestId("language").textContent).toBe(language);
    expect(document.documentElement.lang).toBe(language);
    expect(document.documentElement.dir).toBe("rtl");
    expect(localStorage.getItem("ramaverse_lang")).toBe("en");
    fireEvent.click(screen.getByRole("button", { name: "Tamil" }));
    expect(document.documentElement.lang).toBe("ta");
    expect(document.documentElement.dir).toBe("ltr");
    expect(screen.getByTestId("title").textContent).toBe("நித்திய ராமவெர்ஸை ஆராயுங்கள்");
    expect(localStorage.getItem("ramaverse_lang")).toBe("en");
  });

  it("falls back safely when reads and writes are both denied and still accepts session locale changes", () => {
    blockWrites();
    const original = Storage.prototype.getItem;
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(function(this: Storage, key: string) {
      if (key === "ramaverse_lang") throw new DOMException("Blocked", "SecurityError");
      return original.call(this, key);
    });
    vi.spyOn(console, "warn").mockImplementation(() => {});
    document.documentElement.lang = "ar"; document.documentElement.dir = "rtl";
    render(<MultilingualProvider><Probe /></MultilingualProvider>);
    expect(document.documentElement.lang).toBe("en");
    expect(document.documentElement.dir).toBe("ltr");
    fireEvent.click(screen.getByRole("button", { name: "Urdu" }));
    expect(document.documentElement.lang).toBe("ur");
    expect(document.documentElement.dir).toBe("rtl");
  });
});
