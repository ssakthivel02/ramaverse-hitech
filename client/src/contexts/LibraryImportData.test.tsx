import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LibraryProvider, useLibrary } from "./LibraryContext";

const initial = {
  bookmarks: [{ id: "b1", type: "sarga", itemId: "fixture", title: "Existing bookmark", timestamp: 1 }],
  journalNotes: [{ id: "n1", title: "Existing journal", content: "Existing reflection", timestamp: 1 }],
  readingProgress: [{ recordKey: "fixture", updatedAt: 1 }],
};

function RestoreProbe({ backup }: { backup: unknown }) {
  const { bookmarks, journalNotes, readingProgress, importData } = useLibrary();
  const [accepted, setAccepted] = React.useState<boolean | null>(null);
  return <>
    <button onClick={() => setAccepted(importData(JSON.stringify(backup)))}>Restore fixture</button>
    <output data-testid="accepted">{String(accepted)}</output>
    <output data-testid="library">{JSON.stringify({ bookmarks, journalNotes, readingProgress })}</output>
  </>;
}

function seed() {
  localStorage.setItem("ramaverse_bookmarks", JSON.stringify(initial.bookmarks));
  localStorage.setItem("ramaverse_journal", JSON.stringify(initial.journalNotes));
  localStorage.setItem("ramaverse_sarga_progress", JSON.stringify(initial.readingProgress));
}

async function restore(backup: unknown) {
  seed();
  const user = userEvent.setup();
  render(<LibraryProvider><RestoreProbe backup={backup} /></LibraryProvider>);
  await user.click(screen.getByRole("button", { name: "Restore fixture" }));
}

async function expectLibrary(expected: typeof initial) {
  expect(JSON.parse(screen.getByTestId("library").textContent || "{}")).toEqual(expected);
  await waitFor(() => {
    expect(JSON.parse(localStorage.getItem("ramaverse_bookmarks") || "null")).toEqual(expected.bookmarks);
    expect(JSON.parse(localStorage.getItem("ramaverse_journal") || "null")).toEqual(expected.journalNotes);
    expect(JSON.parse(localStorage.getItem("ramaverse_sarga_progress") || "null")).toEqual(expected.readingProgress);
  });
}

describe("Library restore validates before replacement", () => {
  afterEach(() => { cleanup(); localStorage.clear(); });

  it("rejects a malformed bookmark without replacing any state or persisted data", async () => {
    await restore({ bookmarks: [null], journalNotes: [] });
    expect(screen.getByTestId("accepted").textContent).toBe("false");
    await expectLibrary(initial);
  });

  it("rejects malformed progress before otherwise valid collections can replace data", async () => {
    await restore({ bookmarks: [], journalNotes: [], readingProgress: [null] });
    expect(screen.getByTestId("accepted").textContent).toBe("false");
    await expectLibrary(initial);
  });

  it("retains current reading progress when restoring a valid legacy backup", async () => {
    await restore({ bookmarks: [], journalNotes: [], version: 1 });
    expect(screen.getByTestId("accepted").textContent).toBe("true");
    await expectLibrary({ ...initial, bookmarks: [], journalNotes: [] });
  });

  it("allows a valid current backup to replace all three collections", async () => {
    await restore({ bookmarks: [], journalNotes: [], readingProgress: [], version: 2 });
    expect(screen.getByTestId("accepted").textContent).toBe("true");
    await expectLibrary({ bookmarks: [], journalNotes: [], readingProgress: [] });
  });
});
