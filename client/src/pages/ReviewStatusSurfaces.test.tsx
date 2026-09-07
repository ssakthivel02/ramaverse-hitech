import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@/components/RamaNavbar", () => ({ RamaNavbar: () => null }));
vi.mock("@/components/RamaFooter", () => ({ RamaFooter: () => null }));
vi.mock("@/lib/trpc", () => ({
  trpc: {
    ramaverse: {
      getWisdom: {
        useQuery: () => ({
          isLoading: false,
          data: [{
            id: 1,
            recordNumber: 1,
            category: "Dharma",
            title: "Review-state wisdom",
            shlokaSanskrit: "",
            translation: "A test record.",
            philosophicalInsight: "A test insight.",
            sourceReference: "Source pending review",
            reviewStatus: "needs_source_review",
          }],
        }),
      },
      guidedSearch: {
        useQuery: () => ({
          isLoading: false,
          data: {
            wisdom: [{ id: 1, recordNumber: 1, title: "Search review-state wisdom", translation: "A test result.", reviewStatus: "needs_source_review" }],
            characters: [],
            places: [],
            guidance: [],
            stories: [],
            quizzes: [],
            audio: [],
          },
        }),
      },
    },
  },
}));

import Wisdom from "./Wisdom";
import SearchPage from "./Search";

describe("RamaVerse review-status surfaces", () => {
  afterEach(cleanup);

  it("renders the record review state on a primary Wisdom collection card", () => {
    render(<Wisdom />);

    expect(screen.getByText(/Editorial review: needs source review/i)).toBeDefined();
  });

  it("renders the record review state in guided search results", async () => {
    const user = userEvent.setup();
    render(<SearchPage />);

    await user.type(screen.getByPlaceholderText(/Type to search across the entire RamaVerse universe/i), "wisdom");

    expect(screen.getByText(/Editorial review: needs source review/i)).toBeDefined();
  });

  it("filters visible guided-search results by canonical content type without exposing staging", async () => {
    const user = userEvent.setup();
    render(<SearchPage />);

    await user.type(screen.getByPlaceholderText(/Type to search across the entire RamaVerse universe/i), "wisdom");
    expect(screen.getByText(/Search is canonical-only/i)).toBeDefined();
    await user.selectOptions(screen.getByLabelText(/Content type/i), "characters");
    expect(screen.getByText(/No records found matching/i)).toBeDefined();
  });

  it("keeps search facets labelled at a compact viewport", () => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 375 });
    render(<SearchPage />);

    expect(screen.getByLabelText(/Content type/i)).toBeDefined();
    expect(screen.getByLabelText(/Review state/i)).toBeDefined();
  });
});
