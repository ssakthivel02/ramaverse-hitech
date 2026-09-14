import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

vi.mock("@/components/RamaNavbar", () => ({ RamaNavbar: () => null }));
vi.mock("@/components/RamaFooter", () => ({ RamaFooter: () => null }));
vi.mock("@/components/motion/MotionPrimitives", () => ({ ReaderPageTurn: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));
vi.mock("@/components/intelligence/IntelligencePanels", () => ({
  ContextualReaderAssistant: () => null,
  ExplainForChildren: () => null,
  ExplainInTamil: () => null,
  ExplainSimply: () => null,
  ReadAloud: () => null,
  SourceComparisonCard: () => null,
}));
vi.mock("@/contexts/LibraryContext", () => ({
  useLibrary: () => ({ addBookmark: vi.fn(), removeBookmark: vi.fn(), isBookmarked: () => false, markSargaRead: vi.fn(), markSargaUnread: vi.fn(), readingProgress: [] }),
}));
vi.mock("@/contexts/MultilingualContext", () => ({
  SUPPORTED_LANGUAGES: [{ code: "en", nativeLabel: "English" }],
  localizedPath: (_language: string, path: string) => path,
  useTranslation: () => ({
    language: "en",
    setLanguage: vi.fn(),
    getLanguageMeta: () => ({ nativeLabel: "English", contentStatus: "source_verified" }),
    t: (key: string) => key,
  }),
}));
vi.mock("@/lib/trpc", () => ({
  trpc: { ramaverse: {
    getSargaDetail: { useQuery: () => ({ isLoading: false, error: null, data: { current: {
      recordKey: "VR-IITK-BALA-001",
      editionId: "IITK_VALMIKI_DIGITAL_TEXT",
      kandaNumber: 1,
      sargaIdentifier: "Bala Kanda 1.1",
      editorialDescriptor: "Valmiki's question to Narada",
      summary: "An editorial summary.",
      sourceId: "SR-06",
      sourceLocator: "https://example.com/source",
      traditionId: "VALMIKI_RAMAYANA",
      reviewStatus: "source_verified",
    }, previous: null, next: null } }) },
  } },
}));

import SargaReader from "./SargaReader";

describe("Sarga reader source panel disclosure", () => {
  it("exposes collapsed and expanded state for the controlled source panel", () => {
    render(<SargaReader />);

    const toggle = screen.getByRole("button", { name: /sourcePanel/i });
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(toggle.getAttribute("aria-controls")).toBe("sarga-source-panel");
    expect(document.getElementById("sarga-source-panel")).toBeNull();

    fireEvent.click(toggle);

    expect(screen.getByRole("button", { name: /hideSource/i }).getAttribute("aria-expanded")).toBe("true");
    expect(document.getElementById("sarga-source-panel")).not.toBeNull();
  });
});
