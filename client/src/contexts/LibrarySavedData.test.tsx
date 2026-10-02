import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LibraryProvider, useLibrary } from "./LibraryContext";

const keys = ["ramaverse_bookmarks", "ramaverse_journal", "ramaverse_sarga_progress"];
const initial = {
  bookmarks: [{ id: "b1", type: "sarga", itemId: "fixture", title: "Existing bookmark", timestamp: 1 }],
  journalNotes: [{ id: "n1", title: "Existing journal", content: "Synthetic reflection", timestamp: 1 }],
  readingProgress: [{ recordKey: "fixture", updatedAt: 1 }],
};
const warning = "Some saved library data could not be read and has been left unchanged. Changes to affected collections will not be saved until you restore a valid backup or clear the library. Export a backup of this session before leaving.";

function Probe({ backup = initial }: { backup?: unknown }) {
  const library = useLibrary();
  const [accepted, setAccepted] = React.useState<boolean | null>(null);
  return <>
    <button onClick={() => library.addBookmark({ type: "sarga", itemId: "session", title: "Session bookmark" })}>Bookmark</button>
    <button onClick={() => library.addJournalNote("Session note", "Synthetic note")}>Write note</button>
    <button onClick={() => library.markSargaRead("session")}>Read</button>
    <button onClick={library.clearAllData}>Clear</button>
    <button onClick={() => setAccepted(library.importData(JSON.stringify(backup)))}>Restore</button>
    <output data-testid="accepted">{String(accepted)}</output>
    <output data-testid="state">{JSON.stringify({ bookmarks: library.bookmarks, journalNotes: library.journalNotes, readingProgress: library.readingProgress })}</output>
    <output data-testid="bookmarked">{String(library.isBookmarked("fixture", "sarga"))}</output>
  </>;
}
function seed() {
  Object.values(initial).forEach((value, index) => localStorage.setItem(keys[index], JSON.stringify(value)));
}
const memory = () => JSON.parse(screen.getByTestId("state").textContent || "{}");
const stored = () => keys.map(key => localStorage.getItem(key));

describe("Library validates saved collections before hydration", () => {
  afterEach(() => { cleanup(); vi.restoreAllMocks(); localStorage.clear(); });

  it.each([
    ["null bookmarks", 0, "null"],
    ["object bookmarks", 0, "{}"],
    ["null bookmark entry", 0, "[null]"],
    ["invalid journal content", 1, JSON.stringify([{ ...initial.journalNotes[0], content: {} }])],
    ["invalid progress", 2, JSON.stringify([{ recordKey: {}, updatedAt: 1 }])],
    ["broken JSON", 1, "{broken"],
  ] as const)("preserves %s while valid collections remain usable", async (_label, index, raw) => {
    seed();
    localStorage.setItem(keys[index], raw);
    const before = stored();
    const user = userEvent.setup();
    render(<LibraryProvider><Probe /></LibraryProvider>);
    expect(screen.getByRole("alert").textContent).toBe(warning);
    const expected = { ...initial, [Object.keys(initial)[index]]: [] };
    expect(memory()).toEqual(expected);
    expect(stored()).toEqual(before);
    await user.click(screen.getByRole("button", { name: "Bookmark" }));
    await user.click(screen.getByRole("button", { name: "Write note" }));
    await user.click(screen.getByRole("button", { name: "Read" }));
    expect(memory().bookmarks).toHaveLength(index === 0 ? 1 : 2);
    expect(memory().journalNotes).toHaveLength(index === 1 ? 1 : 2);
    expect(memory().readingProgress).toHaveLength(index === 2 ? 1 : 2);
    expect(localStorage.getItem(keys[index])).toBe(raw);
    for (let i = 0; i < keys.length; i++) {
      if (i !== index) expect(JSON.parse(localStorage.getItem(keys[i]) || "null")).toEqual(Object.values(memory())[i]);
    }
  });

  it("loads valid data and missing keys without a warning", () => {
    seed();
    localStorage.removeItem(keys[2]);
    render(<LibraryProvider><Probe /></LibraryProvider>);
    expect(memory()).toEqual({ ...initial, readingProgress: [] });
    expect(screen.getByTestId("bookmarked").textContent).toBe("true");
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("does not overwrite a key when its initial read is denied", () => {
    seed();
    const originalGet = Storage.prototype.getItem;
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(function(this: Storage, key: string) {
      if (key === keys[0]) throw new DOMException("Blocked", "SecurityError");
      return originalGet.call(this, key);
    });
    const write = vi.spyOn(Storage.prototype, "setItem");
    render(<LibraryProvider><Probe /></LibraryProvider>);
    expect(memory().bookmarks).toEqual([]);
    expect(screen.getByRole("alert").textContent).toBe(warning);
    expect(write.mock.calls.some(([key]) => key === keys[0])).toBe(false);
    expect(originalGet.call(localStorage, keys[0])).toBe(JSON.stringify(initial.bookmarks));
  });

  it("unlocks only replaced collections for a valid legacy restore", async () => {
    seed();
    keys.forEach(key => localStorage.setItem(key, "[null]"));
    const user = userEvent.setup();
    render(<LibraryProvider><Probe backup={{ bookmarks: initial.bookmarks, journalNotes: initial.journalNotes }} /></LibraryProvider>);
    await user.click(screen.getByRole("button", { name: "Restore" }));
    expect(screen.getByTestId("accepted").textContent).toBe("true");
    expect(memory()).toEqual({ ...initial, readingProgress: [] });
    expect(stored()).toEqual([JSON.stringify(initial.bookmarks), JSON.stringify(initial.journalNotes), "[null]"]);
    expect(screen.getByRole("alert").textContent).toBe(warning);
  });

  it("rejects a bad restore without unlocking unreadable storage", async () => {
    seed();
    localStorage.setItem(keys[0], "null");
    const before = stored();
    const user = userEvent.setup();
    render(<LibraryProvider><Probe backup={{ bookmarks: [null], journalNotes: [] }} /></LibraryProvider>);
    await user.click(screen.getByRole("button", { name: "Restore" }));
    expect(screen.getByTestId("accepted").textContent).toBe("false");
    expect(stored()).toEqual(before);
    expect(screen.getByRole("alert").textContent).toBe(warning);
  });

  it("unlocks all collections after an explicit valid full restore", async () => {
    keys.forEach(key => localStorage.setItem(key, "[null]"));
    const user = userEvent.setup();
    render(<LibraryProvider><Probe /></LibraryProvider>);
    await user.click(screen.getByRole("button", { name: "Restore" }));
    await waitFor(() => expect(screen.queryByRole("alert")).toBeNull());
    expect(memory()).toEqual(initial);
    expect(stored()).toEqual(Object.values(initial).map(value => JSON.stringify(value)));
  });

  it("allows an explicit clear to replace unreadable data and persist later edits", async () => {
    keys.forEach(key => localStorage.setItem(key, "[null]"));
    const user = userEvent.setup();
    render(<LibraryProvider><Probe /></LibraryProvider>);
    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(screen.queryByRole("alert")).toBeNull();
    expect(stored()).toEqual(["[]", "[]", "[]"]);
    await user.click(screen.getByRole("button", { name: "Write note" }));
    expect(JSON.parse(localStorage.getItem(keys[1]) || "null")).toEqual(memory().journalNotes);
  });
});
