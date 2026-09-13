import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

vi.mock("@/components/RamaNavbar", () => ({ RamaNavbar: () => null }));
vi.mock("@/components/RamaFooter", () => ({ RamaFooter: () => null }));
vi.mock("@/lib/trpc", () => ({
  trpc: {
    ramaverse: {
      getGuidance: {
        useQuery: () => ({
          isLoading: false,
          error: null,
          data: [{
            id: 1,
            recordNumber: 1,
            title: "A bounded application",
            advice: "A careful reflection.",
            theme: "Leadership & Duty",
            kandaReference: "Ayodhya",
            characterReference: "Rama",
            reviewStatus: "human_reviewed",
          }],
        }),
      },
      getGuidanceDevotionBoundary: {
        useQuery: () => ({ data: undefined, error: new Error("boundary unavailable") }),
      },
    },
  },
}));

import Guidance from "./Guidance";

describe("Guidance boundary error state", () => {
  afterEach(cleanup);

  it("does not present fallback boundary claims when the boundary API fails", () => {
    render(<Guidance />);

    expect(screen.getByRole("alert")).toBeTruthy();
    expect(screen.queryByRole("region", { name: /Guidance and devotional boundary/i })).toBeNull();
  });
});
