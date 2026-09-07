import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@/components/RamaNavbar", () => ({ RamaNavbar: () => null }));
vi.mock("@/components/RamaFooter", () => ({ RamaFooter: () => null }));
vi.mock("@/lib/trpc", () => ({
  trpc: { ramaverse: { getCharacters: { useQuery: () => ({ isLoading: false, data: [{ id: 1, characterNumber: 1, name: "Sri Rama", title: "Current corpus profile", roleCategory: "Protagonists & Royals", description: "Current description.", appearances: ["Bala Kanda"], reviewStatus: "needs_source_review" }, { id: 2, characterNumber: 2, name: "Sita Devi", title: "Current corpus profile", roleCategory: "Protagonists & Royals", description: "Current description.", appearances: ["Bala Kanda"], reviewStatus: "needs_source_review" }] }) } } },
}));

import Characters from "./Characters";

describe("Character evidence disclosure", () => {
  afterEach(cleanup);

  it("withholds relationship claims until source evidence is available", async () => {
    const user = userEvent.setup();
    render(<Characters />);
    await user.click(screen.getAllByRole("button", { name: /view evidence state/i })[0]);

    expect(screen.getByRole("heading", { name: "Sri Rama", level: 2 })).toBeDefined();
    expect(screen.getByText(/Withheld until person-level source evidence is published/i)).toBeDefined();
    expect(screen.getByText(/No source-linked entity mapping is published/i)).toBeDefined();
    expect(screen.getByText(/No source-backed alias list/i)).toBeDefined();
    expect(screen.getByRole("heading", { name: /Lineage & qualities evidence/i })).toBeDefined();
    expect(screen.getByText(/no source-verified lineage edge or independent qualities register is published/i)).toBeDefined();
    expect(screen.getAllByText(/NOT PUBLISHED/i).length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: /Relationship evidence navigator/i })).toBeDefined();
    expect(screen.getByText(/Published relationship edges:/i)).toBeDefined();
    await user.selectOptions(screen.getByLabelText("First profile"), "1");
    await user.selectOptions(screen.getByLabelText("Second profile"), "2");
    await user.click(screen.getByRole("button", { name: /inspect evidence gap/i }));
    expect(screen.getByText(/No source-verified relationship edge is published/i)).toBeDefined();
    expect(screen.getByRole("heading", { name: "Sita Devi", level: 2 })).toBeDefined();
  });
});
