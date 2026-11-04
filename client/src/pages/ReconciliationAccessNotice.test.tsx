import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ReconciliationAccessNotice } from "./ReconciliationWorkbench";

describe("restricted reconciliation evidence display", () => {
  it("explains owner restriction without exposing unpublished staging records", () => {
    render(<ReconciliationAccessNotice restricted />);
    expect(screen.getByRole("status", { name: "Editorial preview access status" })).toBeTruthy();
    expect(screen.getByText("Editorial access restricted")).toBeTruthy();
    expect(screen.getByText(/approved owner sign-in is required/i)).toBeTruthy();
    expect(screen.queryByText(/candidate evidence/i)).toBeNull();
  });

  it("fails closed and does not claim approval on a preview error", () => {
    render(<ReconciliationAccessNotice restricted={false} />);
    expect(screen.getByText("Editorial preview unavailable")).toBeTruthy();
    expect(screen.getByText(/No staging or unpublished records are shown/i)).toBeTruthy();
    expect(screen.getByText(/Canonical publication remains disabled/i)).toBeTruthy();
  });
});
