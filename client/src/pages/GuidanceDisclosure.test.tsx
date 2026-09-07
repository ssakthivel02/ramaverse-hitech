import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

vi.mock("@/components/RamaNavbar", () => ({ RamaNavbar: () => null }));
vi.mock("@/components/RamaFooter", () => ({ RamaFooter: () => null }));
vi.mock("@/lib/trpc", () => ({ trpc: { ramaverse: { getGuidance: { useQuery: () => ({ isLoading: false, data: [{ id: 1, recordNumber: 1, title: "A bounded application", advice: "A careful reflection.", theme: "Leadership & Duty", kandaReference: "Ayodhya", characterReference: "Rama", reviewStatus: "human_reviewed" }] }) }, getGuidanceDevotionBoundary: { useQuery: () => ({ data: { guidance: { evidenceRule: "Guidance is a source-limited editorial application." }, devotion: { recordCount: 0, evidenceRule: "No devotional outcome or remedy is guaranteed." } } }) } } } }));

import Guidance from "./Guidance";

describe("Guidance disclosure", () => {
  afterEach(cleanup);

  it("separates editorial application from devotional guarantees", () => {
    render(<Guidance />);
    expect(screen.getByRole("region", { name: /Guidance and devotional boundary/i }).textContent).toMatch(/not a devotional guarantee/i);
    expect(screen.getAllByText(/EDITORIAL APPLICATION/i).length).toBeGreaterThan(0);
  });
});
