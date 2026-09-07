import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

vi.mock("@/components/RamaNavbar", () => ({ RamaNavbar: () => null }));
vi.mock("@/components/RamaFooter", () => ({ RamaFooter: () => null }));
vi.mock("@/lib/trpc", () => ({
  trpc: { ramaverse: {
    guidedSearch: { useQuery: () => ({ isLoading: false, data: { wisdom: [], characters: [], places: [], guidance: [], stories: [], quizzes: [], audio: [], sargas: [{ recordKey: "VR-IITK-BALA-001", kandaNumber: 1, editionId: "IITK", sargaIdentifier: "தமிழ் Bala Kanda 1.1", summary: "தமிழ் editorial summary with English source metadata.", reviewStatus: "source_verified" }] } }) },
  } },
}));

import SearchPage from "./Search";
import KnowledgeGraph from "./KnowledgeGraph";
import { APPROVED_UNIVERSE_RECORDS } from "@/lib/knowledgeUniverse";

describe("Mixed-script surface guards", () => {
  afterEach(cleanup);

  it("renders script-safe search controls and a responsive graph/list fallback", () => {
    const { unmount } = render(<SearchPage />);
    expect(screen.getByRole("main").className).toContain("script-safe");
    const searchInput = screen.getByPlaceholderText(/Type to search/i);
    expect(searchInput.className).toContain("script-safe");
    fireEvent.change(searchInput, { target: { value: "தமிழ் Bala" } });
    const resultCard = screen.getByText("தமிழ் Bala Kanda 1.1").closest("article");
    expect(resultCard?.className).toContain("script-safe");
    expect(resultCard?.className).toContain("leading-relaxed");
    expect(resultCard?.style.minWidth).toBe("0px");
    expect(resultCard?.style.overflowWrap).toBe("anywhere");
    expect(resultCard?.style.lineHeight).toBe("1.5");
    unmount();

    render(<KnowledgeGraph />);
    const record = screen.getByText(APPROVED_UNIVERSE_RECORDS[0].id).closest("article");
    expect(record?.className).toContain("temple-card");
    expect(record?.textContent).toContain(APPROVED_UNIVERSE_RECORDS[0].locator);
    expect(record?.textContent).toContain(APPROVED_UNIVERSE_RECORDS[0].sourceIds[0]);
  });
});
