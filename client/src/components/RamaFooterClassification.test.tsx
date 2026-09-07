import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { RamaFooter } from "./RamaFooter";

describe("RamaFooter corpus classification legend", () => {
  afterEach(cleanup);

  it("makes the full source-layer vocabulary available to every footer-equipped module", () => {
    render(<RamaFooter />);
    const legend = screen.getByRole("region", { name: /Corpus classification legend/i });
    ["VERIFIED CANONICAL", "SOURCE ACQUIRED", "TRADITIONAL", "LATER TEXT", "REGIONAL"].forEach((label) => expect(legend.textContent).toContain(label));
  });
});
