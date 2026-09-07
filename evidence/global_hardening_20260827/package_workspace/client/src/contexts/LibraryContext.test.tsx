import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LibraryProvider, useLibrary } from "./LibraryContext";

function ProgressProbe() {
  const { markSargaRead, markSargaUnread, readingProgress } = useLibrary();
  return <><button onClick={() => markSargaRead("VR-IITK-BALA-001")}>Mark Sarga Read</button><button onClick={() => markSargaUnread("VR-IITK-BALA-001")}>Mark Sarga Unread</button><output data-testid="progress">{readingProgress.map(item => item.recordKey).join(",")}</output></>;
}

describe("RamaVerse local reading progress", () => {
  afterEach(() => { cleanup(); localStorage.clear(); });

  it("stores a source-located Sarga reading marker locally", async () => {
    const user = userEvent.setup();
    render(<LibraryProvider><ProgressProbe /></LibraryProvider>);

    await user.click(screen.getByRole("button", { name: /mark sarga read/i }));
    expect(screen.getByTestId("progress").textContent).toBe("VR-IITK-BALA-001");
    await waitFor(() => expect(JSON.parse(localStorage.getItem("ramaverse_sarga_progress") || "[]")[0].recordKey).toBe("VR-IITK-BALA-001"));
    await user.click(screen.getByRole("button", { name: /mark sarga unread/i }));
    expect(screen.getByTestId("progress").textContent).toBe("");
    await waitFor(() => expect(JSON.parse(localStorage.getItem("ramaverse_sarga_progress") || "[]")).toEqual([]));
  });
});
