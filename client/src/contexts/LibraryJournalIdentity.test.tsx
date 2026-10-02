import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { LibraryProvider, useLibrary, type JournalNote } from "./LibraryContext";

const seeded: JournalNote[] = [
  { id: "note_1000", title: "Seed note", content: "Synthetic old reflection", timestamp: 1 },
  { id: "note_1000_1", title: "Seed suffix", content: "Synthetic suffix reflection", timestamp: 2 },
];
function Probe({ backup }: { backup?: JournalNote[] }) {
  const library = useLibrary();
  return <>
    <button onClick={() => { library.addJournalNote("First", "Synthetic first"); library.addJournalNote("Second", "Synthetic second"); library.addJournalNote("", "Synthetic third"); }}>Add batch</button>
    <button onClick={() => library.deleteJournalNote(library.journalNotes[0].id)}>Delete newest</button>
    <button onClick={() => library.importData(JSON.stringify({ bookmarks: [], journalNotes: backup || [], readingProgress: [] }))}>Restore</button>
    <output data-testid="notes">{JSON.stringify(library.journalNotes)}</output>
  </>;
}
const notes = () => JSON.parse(screen.getByTestId("notes").textContent || "[]") as JournalNote[];
const persisted = () => JSON.parse(localStorage.getItem("ramaverse_journal") || "[]") as JournalNote[];

describe("Journal note identities survive timestamp collisions", () => {
  afterEach(() => { cleanup(); vi.restoreAllMocks(); localStorage.clear(); });

  it("keeps batched same-timestamp notes distinct and deletes only the chosen note", () => {
    vi.spyOn(Date, "now").mockReturnValue(1000);
    render(<LibraryProvider><Probe /></LibraryProvider>);
    fireEvent.click(screen.getByRole("button", { name: "Add batch" }));
    const before = notes();
    expect(before.map(note => note.title)).toEqual(["Spiritual Reflection", "Second", "First"]);
    expect(before.map(note => note.timestamp)).toEqual([1000, 1000, 1000]);
    expect(new Set(before.map(note => note.id)).size).toBe(3);
    expect(persisted()).toEqual(before);
    fireEvent.click(screen.getByRole("button", { name: "Delete newest" }));
    expect(notes()).toEqual(before.slice(1));
    expect(persisted()).toEqual(before.slice(1));
  });

  it("avoids loaded IDs and suffixes without changing existing note content", () => {
    vi.spyOn(Date, "now").mockReturnValue(1000);
    localStorage.setItem("ramaverse_journal", JSON.stringify(seeded));
    render(<LibraryProvider><Probe /></LibraryProvider>);
    fireEvent.click(screen.getByRole("button", { name: "Add batch" }));
    expect(notes()).toHaveLength(5);
    expect(new Set(notes().map(note => note.id)).size).toBe(5);
    expect(notes().slice(-2)).toEqual(seeded);
    expect(persisted()).toEqual(notes());
  });

  it("avoids IDs in a just-restored backup under the same clock", () => {
    vi.spyOn(Date, "now").mockReturnValue(1000);
    render(<LibraryProvider><Probe backup={seeded} /></LibraryProvider>);
    fireEvent.click(screen.getByRole("button", { name: "Restore" }));
    fireEvent.click(screen.getByRole("button", { name: "Add batch" }));
    expect(new Set(notes().map(note => note.id)).size).toBe(5);
    expect(notes().slice(-2)).toEqual(seeded);
    fireEvent.click(screen.getByRole("button", { name: "Delete newest" }));
    expect(notes()).toHaveLength(4);
    expect(notes().slice(-2)).toEqual(seeded);
  });

  it("remains distinct when the clock rolls back to an earlier note timestamp", () => {
    const clock = vi.spyOn(Date, "now").mockReturnValue(1000);
    render(<LibraryProvider><Probe /></LibraryProvider>);
    fireEvent.click(screen.getByRole("button", { name: "Add batch" }));
    clock.mockReturnValue(2000);
    fireEvent.click(screen.getByRole("button", { name: "Add batch" }));
    clock.mockReturnValue(1000);
    fireEvent.click(screen.getByRole("button", { name: "Add batch" }));
    expect(notes()).toHaveLength(9);
    expect(new Set(notes().map(note => note.id)).size).toBe(9);
    expect(persisted()).toEqual(notes());
  });
});
