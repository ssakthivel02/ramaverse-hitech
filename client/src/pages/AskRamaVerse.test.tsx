import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

vi.mock("@/components/RamaNavbar", () => ({ RamaNavbar: () => null }));
vi.mock("@/components/RamaFooter", () => ({ RamaFooter: () => null }));
vi.mock("@/lib/trpc", () => ({ trpc: { ramaverse: { askGrounded: { useQuery: ({ query }: { query: string }) => ({ isLoading: false, data: query ? { answer: "Hanuman is present in the canonical corpus.", supportingRecords: ["Hanuman"], supportingRecordDetails: [{ recordId: "CHR-12", label: "Hanuman", type: "character", reviewStatus: "needs_source_review", sourceReference: null }], provenance: { corpusLayer: "published_canonical_only", stagingExcluded: true, reviewStatuses: ["needs_source_review"], sourceReferences: [] }, confidence: "High (Direct Database Match)" } : undefined }) } } } }));

import AskRamaVerse from "./AskRamaVerse";

describe("Ask RamaVerse provenance", () => {
  it("renders canonical-only provenance and never labels staging as answer evidence", async () => {
    render(<AskRamaVerse />);
    expect(screen.getByLabelText(/Ask a grounded RamaVerse question/i)).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: /Who is Hanuman/i }));

    await waitFor(() => {
      const els = screen.queryAllByLabelText(/Canonical answer provenance/i);
      expect(els.length).toBeGreaterThan(0);
    });
    expect(screen.getAllByText(/Published Canonical Corpus Only/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Staging excluded/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/CHR-12/i)).toBeDefined();
    expect(screen.queryByText(/stg-v2/i)).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /Who is Hanuman/i }));
    await waitFor(() => expect(screen.getAllByText(/Hanuman is present in the canonical corpus/i).length).toBe(2));
  });
});
