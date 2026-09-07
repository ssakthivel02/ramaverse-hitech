import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

vi.mock("@/components/RamaNavbar", () => ({ RamaNavbar: () => null }));
vi.mock("@/components/RamaFooter", () => ({ RamaFooter: () => null }));
vi.mock("@/lib/trpc", () => ({
  trpc: { ramaverse: {
    getKandas: { useQuery: () => ({ isLoading: false, data: [
      { id: 1, kandaNumber: 1, name: "Bala Kanda", sanskritName: "Bala", sargasCount: 77, summary: "Verified summary.", keyEvents: ["Milestone"], reviewStatus: "source_verified" },
      { id: 2, kandaNumber: 2, name: "Ayodhya Kanda", sanskritName: "Ayodhya", sargasCount: 119, summary: "Coverage withheld.", keyEvents: [], reviewStatus: "needs_source_review" },
      { id: 3, kandaNumber: 3, name: "Aranya Kanda", sanskritName: "Aranya", sargasCount: 75, summary: "No locator acquired.", keyEvents: [], reviewStatus: "needs_source_review" },
    ] }) },
    getSargas: { useQuery: () => ({ data: [{ recordKey: "VR-IITK-BALA-001", kandaNumber: 1, sargaIdentifier: "Bala 1", editorialDescriptor: "Verified opening", summary: "Stored editorial summary.", reviewStatus: "source_verified", sourceLocator: "https://example.org/source", sourceId: "SRC", editionId: "ED" }] }) },
    getSourceReviewPreview: { useQuery: () => ({ data: { evidenceAvailable: true, kandaNumber: 2, sargaIdentifier: "Ayodhya Kanda 2.21", englishEditorialDescriptor: "Source-governed review summary.", tamilTitleStatus: "NEEDS_HUMAN_TAMIL_REVIEW", sourceTextStatus: "SOURCE_ACQUIRED" } }) },
    getSourceReadinessPreview: { useQuery: () => ({ data: { evidenceAvailable: true, records: [{ recordKey: "SRC-READINESS-AYO-025", kandaNumber: 2, sargaIdentifier: "Ayodhya Kanda 2.25", englishEditorialDescriptor: "Kausalya performs benedictory rites for Rama.", readinessStates: ["SOURCE_ACQUIRED", "NEEDS_RECONCILIATION", "NEEDS_TAMIL_REVIEW"], sourceLocator: "https://example.org/sarga25" }, { recordKey: "SRC-READINESS-AYO-026", kandaNumber: 2, sargaIdentifier: "Ayodhya Kanda 2.26", englishEditorialDescriptor: "Rama speaks with Sita.", readinessStates: ["SOURCE_ACQUIRED", "NEEDS_RECONCILIATION", "NEEDS_TAMIL_REVIEW"], sourceLocator: "https://example.org/sarga26" }] } }) },
    getStagingLedgerPreview: { useQuery: () => ({ data: { evidenceAvailable: true, physicallyAvailableUniqueRecords: 28, latestVerifiedSarga: "Ayodhya Kanda Sarga 20", readinessStates: ["STAGING", "NEEDS_RECONCILIATION", "NEEDS_TAMIL_REVIEW"], publicationStatus: "NOT_CANONICAL" } }) },
  } },
}));

import Kandas from "./Kandas";

describe("Seven Kanda source-safe availability states", () => {
  afterEach(cleanup);

  it("shows verified and not-acquired states without manufacturing metadata", () => {
    render(<Kandas />);
    expect(screen.getAllByText("VERIFIED").length).toBeGreaterThan(0);
    expect(screen.getAllByText("NOT ACQUIRED").length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/Sarga metadata availability/i).textContent).toMatch(/UNDER REVIEW \/ NOT ACQUIRED/i);
    expect(screen.getByText(/No unreviewed translation is presented as source text/i)).toBeDefined();
  });

  it("shows the source-acquired Ayodhya review note without counting or linking it as canonical", () => {
    render(<Kandas />);
    fireEvent.click(screen.getByText("Ayodhya Kanda").closest(".temple-card")!);
    expect(screen.getByLabelText(/Next source-acquired Sarga review/i).textContent).toMatch(/Ayodhya Kanda 2.21/);
    expect(screen.getByText(/excluded from the canonical Sarga count, reader navigation, and public search/i)).toBeDefined();
    expect(screen.queryByRole("link", { name: /Ayodhya Kanda 2.21/i })).toBeNull();
  });

  it("distinguishes source-acquired Sargas 25–26 from published coverage and reader routes", () => {
    render(<Kandas />);
    fireEvent.click(screen.getByText("Ayodhya Kanda").closest(".temple-card")!);
    expect(screen.getAllByText("SOURCE ACQUIRED").length).toBeGreaterThan(0);
    const readinessPanel = screen.getByLabelText(/Quarantined source readiness/i).textContent ?? "";
    expect(readinessPanel).toContain("Ayodhya Kanda 2.25");
    expect(readinessPanel).toContain("Ayodhya Kanda 2.26");
    expect(screen.getByText(/do not contribute reader content, canonical coverage, public search, or offline canonical material/i)).toBeDefined();
    expect(screen.queryByRole("link", { name: /^Ayodhya Kanda 2\.25$/i })).toBeNull();
    const stagingPanel = screen.getByLabelText(/Quarantined staging branch/i).textContent ?? "";
    expect(stagingPanel).toContain("28 records under reconciliation");
    expect(stagingPanel).toContain("STAGING");
    expect(stagingPanel).toContain("NEEDS RECONCILIATION");
  });
});
