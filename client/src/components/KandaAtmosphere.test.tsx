import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { KandaAtmosphere } from "./KandaAtmosphere";

describe("KandaAtmosphere", () => {
  it("renders the selected Kanda identity as decorative atmosphere without exposing duplicate content to assistive technology", () => {
    const { container } = render(<KandaAtmosphere kandaNumber={6} />);
    expect(container.firstElementChild?.classList.contains("rv-kanda-atmosphere--yuddha")).toBe(true);
    expect(screen.getByText("Yuddha")).toBeTruthy();
    expect(container.firstElementChild?.getAttribute("aria-hidden")).toBe("true");
  });

  it("falls back to Bala for an unavailable Kanda number", () => {
    const { container } = render(<KandaAtmosphere kandaNumber={99} />);
    expect(container.firstElementChild?.classList.contains("rv-kanda-atmosphere--bala")).toBe(true);
  });
});
