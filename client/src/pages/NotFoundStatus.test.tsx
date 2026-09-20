import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import NotFound from "./NotFound";

vi.mock("wouter", () => ({
  useLocation: () => ["/missing", vi.fn()],
}));

describe("NotFound accessibility", () => {
  it("announces the unavailable route as a status", () => {
    render(<NotFound />);

    expect(screen.getByRole("status")).toBeTruthy();
  });
});
