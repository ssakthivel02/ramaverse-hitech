import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";

vi.mock("@/components/RamaNavbar", () => ({ RamaNavbar: () => null }));
vi.mock("@/components/RamaFooter", () => ({ RamaFooter: () => null }));
vi.mock("@/contexts/MultilingualContext", () => ({
  useTranslation: () => ({
    language: "hi",
    getLanguageMeta: () => ({ code: "hi", label: "Hindi", nativeLabel: "हिन्दी", contentStatus: "controlled_expansion" }),
  }),
}));
vi.mock("@/lib/trpc", () => ({
  trpc: { ramaverse: {
    getKandas: { useQuery: () => ({ isLoading: false, data: [{ id: 1, kandaNumber: 1, name: "Bala Kanda", sanskritName: "Bala", summary: "Verified summary.", keyEvents: ["Milestone"] }] }) },
    getSargas: { useQuery: () => ({ data: [] }) },
    getCharacters: { useQuery: () => ({ data: [] }) },
  } },
}));

import RamaLife from "./RamaLife";

describe("Rama Life canonical-language safeguards and milestone layers", () => {
  afterEach(cleanup);

  it("discloses a controlled-expansion language and supports age-layer perspective switching", () => {
    render(<RamaLife />);

    expect(screen.getByText(/Canonical-language safeguard/i).textContent).toMatch(/हिन्दी/);
    expect(screen.getByText(/does not generate or imply an unreviewed translation/i)).toBeDefined();
    expect(screen.getAllByRole("link", { name: /Explore source Kanda/i }).length).toBeGreaterThan(0);

    const teenButton = screen.getByRole("button", { name: /Teen Explorer/i });
    fireEvent.click(teenButton);
    expect(screen.getAllByText(/Teen Explorer/i).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "Scholar" }));
    expect(screen.getAllByText(/Source boundary:/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/VERIFIED CANONICAL/i).length).toBeGreaterThan(0);
  });
});
