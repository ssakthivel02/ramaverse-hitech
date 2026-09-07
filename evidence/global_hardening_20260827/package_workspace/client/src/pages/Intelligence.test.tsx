import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

vi.mock("@/components/RamaNavbar", () => ({ RamaNavbar: () => null }));
vi.mock("@/components/RamaFooter", () => ({ RamaFooter: () => null }));
vi.mock("@/contexts/MultilingualContext", () => ({ useTranslation: () => ({ language: "en" }) }));
vi.mock("@/lib/trpc", () => ({ trpc: { ramaverse: { intelligenceAsk: { useQuery: () => ({ isFetching: false, data: { answer: "The canonical corpus connects this question to Hanuman. A canonical character record.", evidence: [{ recordId: "CHR-4", type: "character", title: "Hanuman", excerpt: "A canonical character record.", kanda: "Kishkindha Kanda", sarga: null, sourceLocator: "Valmiki Ramayana Kishkindha Kanda", confidence: "high" }], relatedQuestions: ["What is the source locator for this record?"], characters: [{ recordId: "CHR-4", type: "character", title: "Hanuman", excerpt: "A canonical character record.", kanda: "Kishkindha Kanda", sarga: null, sourceLocator: "Valmiki Ramayana Kishkindha Kanda", confidence: "high" }], places: [], timeline: [], provenance: { corpusLayer: "published_canonical_only", stagingExcluded: true, recordIds: ["CHR-4"], sourceLocators: ["Valmiki Ramayana Kishkindha Kanda"], confidence: "high" }, insufficientEvidence: false, generatedBy: "local-deterministic" } }) } } } }));

import Intelligence from "./Intelligence";

describe("Intelligence workbench", () => {
  it("shows grounded evidence and provenance fields", () => {
    Object.defineProperty(window.navigator, "onLine", { configurable: true, value: true });
    render(<Intelligence />);
    fireEvent.change(screen.getByRole("textbox", { name: /grounded question/i }), { target: { value: "Hanuman" } });
    fireEvent.submit(screen.getByRole("textbox", { name: /grounded question/i }).closest("form")!);
    expect(screen.getAllByText(/A canonical character record/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/CHR-4/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Kishkindha Kanda/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Valmiki Ramayana Kishkindha Kanda/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/staging excluded/i)).toBeDefined();
  });
});
