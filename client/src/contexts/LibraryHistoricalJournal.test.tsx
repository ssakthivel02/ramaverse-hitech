import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { LibraryProvider, useLibrary, type JournalNote } from "./LibraryContext";

const original: JournalNote[] = [
  { id: "note_1000", title: "First", content: "Synthetic first", timestamp: 1 },
  { id: "note_1000", title: "Second", content: "Synthetic second", timestamp: 2 },
  { id: "note_1000_1", title: "Reserved", content: "Synthetic reserved", timestamp: 3 },
];
function Probe() {
  const library = useLibrary();
  return <>
    <button onClick={() => library.deleteJournalNote(library.journalNotes[1].id)}>Delete second</button>
    <button onClick={() => library.importData(JSON.stringify({ bookmarks: [], journalNotes: original }))}>Restore old backup</button>
    <output data-testid="notes">{JSON.stringify(library.journalNotes)}</output>
  </>;
}
const notes = () => JSON.parse(screen.getByTestId("notes").textContent || "[]") as JournalNote[];
const stored = () => JSON.parse(localStorage.getItem("ramaverse_journal") || "[]") as JournalNote[];

describe("Library recovers historical duplicate journal IDs", () => {
  afterEach(() => { cleanup(); vi.restoreAllMocks(); localStorage.clear(); });

  it("loads all notes with distinct IDs and deletes only the selected occurrence", () => {
    localStorage.setItem("ramaverse_journal", JSON.stringify(original));
    render(<LibraryProvider><Probe /></LibraryProvider>);
    const before = notes();
    expect(before.map(note => note.id)).toEqual(["note_1000", "note_1000_2", "note_1000_1"]);
    expect(before.map(note => note.title)).toEqual(["First", "Second", "Reserved"]);
    expect(stored()).toEqual(before);
    fireEvent.click(screen.getByRole("button", { name: "Delete second" }));
    expect(notes()).toEqual([before[0], before[2]]);
    expect(stored()).toEqual([before[0], before[2]]);
  });

  it("normalizes a valid legacy restore while retaining reading progress", () => {
    const progress = [{ recordKey: "fixture", updatedAt: 1 }];
    localStorage.setItem("ramaverse_sarga_progress", JSON.stringify(progress));
    render(<LibraryProvider><Probe /></LibraryProvider>);
    fireEvent.click(screen.getByRole("button", { name: "Restore old backup" }));
    expect(notes().map(note => note.id)).toEqual(["note_1000", "note_1000_2", "note_1000_1"]);
    expect(stored()).toEqual(notes());
    expect(JSON.parse(localStorage.getItem("ramaverse_sarga_progress") || "null")).toEqual(progress);
    fireEvent.click(screen.getByRole("button", { name: "Delete second" }));
    expect(notes().map(note => note.title)).toEqual(["First", "Reserved"]);
  });

  it("keeps recovered identities usable in memory when saving is rejected", () => {
    localStorage.setItem("ramaverse_journal", JSON.stringify(original));
    const setItem = Storage.prototype.setItem;
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(function(this: Storage, key: string, value: string) {
      if (key === "ramaverse_journal") throw new DOMException("Full", "QuotaExceededError");
      setItem.call(this, key, value);
    });
    render(<LibraryProvider><Probe /></LibraryProvider>);
    expect(new Set(notes().map(note => note.id)).size).toBe(3);
    fireEvent.click(screen.getByRole("button", { name: "Delete second" }));
    expect(notes().map(note => note.title)).toEqual(["First", "Reserved"]);
    expect(stored()).toEqual(original);
    expect(screen.getByRole("alert").textContent).toContain("Changes may not survive a reload");
  });
});
