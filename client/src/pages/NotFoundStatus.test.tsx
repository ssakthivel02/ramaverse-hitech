import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "wouter/memory-location";
import { describe, expect, it } from "vitest";
import NotFound from "./NotFound";

describe("NotFound accessibility", () => {
  it("announces the unavailable route as a status", () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>,
    );

    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});
