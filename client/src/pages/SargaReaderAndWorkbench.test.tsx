import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const queryState = vi.hoisted(() => ({ readerLoading: false, workbenchLoading: false, workbenchAttached: false }));

vi.mock("@/components/RamaNavbar", () => ({ RamaNavbar: () => null }));
vi.mock("@/components/RamaFooter", () => ({ RamaFooter: () => null }));
vi.mock("@/contexts/LibraryContext", () => ({
  useLibrary: () => ({ addBookmark: vi.fn(), removeBookmark: vi.fn(), isBookmarked: () => false, markSargaRead: vi.fn(), markSargaUnread: vi.fn(), readingProgress: [{ recordKey: "VR-IITK-BALA-001", updatedAt: 1 }] }),
}));
vi.mock("@/contexts/MultilingualContext", () => ({
  SUPPORTED_LANGUAGES: [{ code: "en", nativeLabel: "English" }, { code: "ta", nativeLabel: "தமிழ்" }],
  localizedPath: (language: string, path: string) => `/${language}${path === "/" ? "" : path}`,
  useTranslation: () => ({
    language: "en",
    setLanguage: vi.fn(),
    getLanguageMeta: () => ({ nativeLabel: "English", contentStatus: "source_verified" }),
    t: (key: string) => ({
      kandaSummary: "Editorial summary", recordPublished: "Published for this source-located record.", openSource: "Source locator", directLocator: "Direct edition locator available.", sourceText: "Verse or section text", sectionNotPublished: "Not published until section-level source verification is complete.", characters: "Characters", entityNotPublished: "Not published until source-linked entity mapping is available.", dialogueLinks: "Dialogue and theme links", readerLoading: "Loading edition-aware Sarga reader…", sargaUnavailable: "Sarga unavailable", sourceRecordOnly: "This route is reserved for source-located records. It is not substituted with invented content.", returnKandas: "Return to Kandas", kandaExplorer: "Seven Kandas", saved: "Saved", save: "Save", markUnread: "Mark unread", markRead: "Mark read", decreaseFont: "Decrease reading font size", increaseFont: "Increase reading font size", hideSource: "Hide source", sourcePanel: "Source panel", readerLanguage: "Reader interface language", markedReadDevice: "Marked read on this device.", progressDevice: "Reading progress is kept on this device.", readerStatusNotice: "The selected interface language does not imply an unreviewed Sarga translation.", summaryDisclosure: "This is an editorial summary. It is not displayed as a verse translation or quotation.", metadataAvailability: "Record metadata availability", unavailableFields: "Unavailable fields are intentionally shown as unavailable rather than inferred from another edition or tradition.", available: "Available", notAcquired: "Not acquired", langStatus: "Source & language status", sourceId: "Source ID", tradition: "Tradition", selectedInterface: "Selected interface", openSourceLocator: "Open source locator", previousSarga: "Previous available Sarga", nextSarga: "Next available Sarga", noEarlier: "No earlier source-located record available", noLater: "No later source-located record available"
    }[key] ?? key),
  }),
}));
vi.mock("@/lib/trpc", () => ({
  trpc: { ramaverse: {
    getSargaDetail: { useQuery: () => ({
      isLoading: queryState.readerLoading,
      data: queryState.readerLoading ? undefined : { current: { recordKey: "VR-IITK-BALA-001", editionId: "IITK_VALMIKI_DIGITAL_TEXT", kandaNumber: 1, sargaIdentifier: "Bala Kanda 1.1", editorialDescriptor: "Valmiki's question to Narada", summary: "An editorial summary.", sourceId: "SR-06", sourceLocator: "https://example.test/source", traditionId: "VALMIKI_RAMAYANA", reviewStatus: "source_verified" }, previous: null, next: null },
    }) },
    getSourceReviewPreview: { useQuery: () => ({ data: { evidenceAvailable: true, recordKey: "SRC-REVIEW-AYO-021", publicationStatus: "NOT_CANONICAL", sargaIdentifier: "Ayodhya Kanda 2.21", editionId: "IITK_VALMIKI_DIGITAL_TEXT", traditionId: "VALMIKI_RAMAYANA", englishEditorialDescriptor: "Lakshmana urges Rama to assume authority; Rama explains obedience to his father's command and seeks Kausalya's assent for forest departure.", tamilTitleStatus: "NEEDS_HUMAN_TAMIL_REVIEW", sourceTextStatus: "SOURCE_ACQUIRED" } }) },
    getReconciliationPreview: { useQuery: () => ({ isLoading: queryState.workbenchLoading, data: queryState.workbenchLoading ? undefined : { historicalCanonicalBaseline: 550, stagingObserved: queryState.workbenchAttached ? 78 : 61, verifiedAttachedRecords: queryState.workbenchAttached ? 78 : 0, stagingCoverage: queryState.workbenchAttached ? "Ayodhya Kanda Sargas 18–23" : null, rawStagingAttached: queryState.workbenchAttached, stagingPublished: 0, candidateNewCanonicalRecords: 0, reconciliationState: "awaiting_v1_4_0_reconciliation", decisionStateCounts: { NEEDS_TAMIL_REVIEW: 78 }, candidateEvidence: [{ candidateId: "stg-v2-ayodhyakanda-s18-event-001", recordType: "EVENT", kanda: "Ayodhya Kanda", sargaReference: "2.18.1–18", sourceLocator: "Valmiki Ramayana, Ayodhya Kanda, Sarga 18", sourceIds: ["src-valmiki-ayodhya-s18-sanskritdocuments"], tradition: "PRIMARY_TEXT", confidence: "high", possibleCanonicalMatch: "POTENTIAL_OVERLAP", possibleLegacyOverlap: true, tamilReview: true, sourceReview: true, decisionState: "NEEDS_TAMIL_REVIEW" }] } }) },
  } },
}));

import SargaReader from "./SargaReader";
import ReconciliationWorkbench from "./ReconciliationWorkbench";

describe("Sarga reader and reconciliation safety surfaces", () => {
  afterEach(cleanup);
  beforeEach(() => { queryState.readerLoading = false; queryState.workbenchLoading = false; queryState.workbenchAttached = false; });

  it("renders a clearly labeled editorial Sarga summary and source panel", async () => {
    const user = userEvent.setup();
    render(<SargaReader />);

    expect(screen.getByRole("heading", { name: /Bala Kanda 1.1/i })).toBeDefined();
    expect(screen.getByText(/It is not displayed as a verse translation or quotation/i)).toBeDefined();
    const languageControl = screen.getByLabelText(/Reader interface language/i);
    languageControl.focus();
    expect(document.activeElement).toBe(languageControl);
    expect(screen.getByText(/Marked read on this device/i).getAttribute("aria-live")).toBe("polite");
    expect(screen.getByRole("button", { name: /mark unread/i })).toBeDefined();
    await user.click(screen.getByRole("button", { name: /source panel/i }));
    expect(screen.getByText("SR-06")).toBeDefined();
    expect(screen.getByText("VALMIKI_RAMAYANA")).toBeDefined();
    const sourcePanel = screen.getByText("SR-06").closest("aside");
    expect(sourcePanel?.className).toContain("script-safe");
    expect(sourcePanel?.style.minWidth).toBe("0px");
    expect(sourcePanel?.style.overflowWrap).toBe("anywhere");
    expect(sourcePanel?.style.lineHeight).toBe("1.5");
  });

  it("presents reconciliation as a non-publishing review surface", () => {
    render(<ReconciliationWorkbench />);

    expect(screen.getByRole("heading", { name: /Reconciliation preview/i })).toBeDefined();
    expect(screen.getByRole("heading", { name: /Ayodhya Kanda 2.21/i })).toBeDefined();
    expect(screen.getByText(/source acquired, not published/i)).toBeDefined();
    expect(screen.getByText(/NEEDS HUMAN TAMIL REVIEW/i)).toBeDefined();
    expect(screen.getByText(/No raw staging payload is loaded/i)).toBeDefined();
    expect(screen.getByText(/Historical baseline/i).closest("section")?.getAttribute("aria-live")).toBe("polite");
    expect(screen.queryByRole("button", { name: /publish/i })).toBeNull();
  });

  it("shows attached 78-record coverage only as non-published workbench scope", () => {
    queryState.workbenchAttached = true;
    render(<ReconciliationWorkbench />);

    expect(screen.getByLabelText(/Attached staging coverage/i).textContent).toMatch(/Ayodhya Kanda Sargas 18–23/i);
    expect(screen.getAllByText(/excluded from public search/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/78 records are visible here only as a dry-run scope/i)).toBeDefined();
    expect(screen.queryByRole("link", { name: /Ayodhya Kanda Sargas 18–23/i })).toBeNull();
    expect(screen.getByText(/Candidate decision evidence/i)).toBeDefined();
    expect(screen.getByText(/stg-v2-ayodhyakanda-s18-event-001/i)).toBeDefined();
    expect(screen.getByLabelText(/Filter staging candidates by decision state/i)).toBeDefined();
  });

  it("announces reader and workbench loading states accessibly", () => {
    queryState.readerLoading = true;
    const reader = render(<SargaReader />);
    expect(screen.getByRole("status").textContent).toMatch(/Loading edition-aware Sarga reader/i);
    reader.unmount();
    queryState.workbenchLoading = true;
    render(<ReconciliationWorkbench />);
    expect(screen.getByText(/Loading dry-run state/i).closest("section")?.getAttribute("aria-live")).toBe("polite");
  });

  it("keeps key reader controls labelled at a compact viewport", () => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 375 });
    render(<SargaReader />);
    expect(screen.getByLabelText(/Reader interface language/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /source panel/i })).toBeDefined();
  });
});
