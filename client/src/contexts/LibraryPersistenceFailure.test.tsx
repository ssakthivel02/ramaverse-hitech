import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LibraryProvider, useLibrary } from "./LibraryContext";

const initial = {
  bookmarks: [{ id: "seed-b", type: "sarga", itemId: "seed", title: "Seed bookmark", timestamp: 1 }],
  journalNotes: [{ id: "seed-n", title: "Seed note", content: "Private fixture", timestamp: 1 }],
  readingProgress: [{ recordKey: "seed", updatedAt: 1 }],
};
const keys = ["ramaverse_bookmarks", "ramaverse_journal", "ramaverse_sarga_progress"];
const warning = "Browser storage could not save your library changes. Changes may not survive a reload. Export a backup before leaving.";

function Probe() {
  const library = useLibrary();
  const [accepted, setAccepted] = React.useState<boolean | null>(null);
  return <>
    <button onClick={() => library.addBookmark({ type: "sarga", itemId: "session", title: "Session bookmark" })}>Bookmark</button>
    <button onClick={() => library.addJournalNote("Session note", "Unsaved reflection")}>Write note</button>
    <button onClick={() => library.markSargaRead("session")}>Read</button>
    <button onClick={library.clearAllData}>Clear</button>
    <button onClick={() => setAccepted(library.importData(JSON.stringify({ bookmarks: [], journalNotes: [], readingProgress: [] })))}>Restore</button>
    <output data-testid="accepted">{String(accepted)}</output>
    <output data-testid="state">{JSON.stringify({ bookmarks: library.bookmarks, journalNotes: library.journalNotes, readingProgress: library.readingProgress })}</output>
  </>;
}

function seedAndBlockWrites() {
  Object.values(initial).forEach((value, index) => localStorage.setItem(keys[index], JSON.stringify(value)));
  let blocked = true;
  const original = Storage.prototype.setItem;
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(function(this: Storage, key: string, value: string) {
    if (blocked && keys.includes(key)) throw new DOMException("Full", "QuotaExceededError");
    original.call(this, key, value);
  });
  return { allowWrites: () => { blocked = false; } };
}
const memory = () => JSON.parse(screen.getByTestId("state").textContent || "{}") as typeof initial;
const stored = () => keys.map(key => JSON.parse(localStorage.getItem(key) || "null"));

describe("Library persistence failures", () => {
  afterEach(() => { cleanup(); vi.restoreAllMocks(); localStorage.clear(); });

  it("keeps all three collections editable in memory without overwriting stored data", async () => {
    seedAndBlockWrites();
    const user = userEvent.setup();
    render(<LibraryProvider><Probe /></LibraryProvider>);
    await screen.findByText(warning);
    await user.click(screen.getByRole("button", { name: "Bookmark" }));
    await user.click(screen.getByRole("button", { name: "Write note" }));
    await user.click(screen.getByRole("button", { name: "Read" }));
    expect(memory().bookmarks).toHaveLength(2);
    expect(memory().journalNotes).toHaveLength(2);
    expect(memory().readingProgress).toHaveLength(2);
    expect(stored()).toEqual(Object.values(initial));
    expect(screen.getByRole("alert").textContent).toBe(warning);
  });

  it("saves pending memory data and clears the warning after storage recovers and another change occurs", async () => {
    const storage = seedAndBlockWrites();
    const user = userEvent.setup();
    render(<LibraryProvider><Probe /></LibraryProvider>);
    await user.click(screen.getByRole("button", { name: "Write note" }));
    expect(stored()).toEqual(Object.values(initial));
    storage.allowWrites();
    await user.click(screen.getByRole("button", { name: "Read" }));
    await waitFor(() => expect(screen.queryByRole("alert")).toBeNull());
    expect(stored()).toEqual(Object.values(memory()));
  });

  it("catches failed clear operations, keeps the warning and does not claim persisted deletion", async () => {
    seedAndBlockWrites();
    const original = Storage.prototype.removeItem;
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(function(this: Storage, key: string) {
      if (keys.includes(key)) throw new DOMException("Blocked", "SecurityError");
      original.call(this, key);
    });
    const user = userEvent.setup();
    render(<LibraryProvider><Probe /></LibraryProvider>);
    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(memory()).toEqual({ bookmarks: [], journalNotes: [], readingProgress: [] });
    expect(stored()).toEqual(Object.values(initial));
    expect(screen.getByRole("alert").textContent).toBe(warning);
  });

  it("retains a valid restored backup in memory while reporting storage failure", async () => {
    seedAndBlockWrites();
    const user = userEvent.setup();
    render(<LibraryProvider><Probe /></LibraryProvider>);
    await user.click(screen.getByRole("button", { name: "Restore" }));
    expect(screen.getByTestId("accepted").textContent).toBe("true");
    expect(memory()).toEqual({ bookmarks: [], journalNotes: [], readingProgress: [] });
    expect(stored()).toEqual(Object.values(initial));
    expect(screen.getByRole("alert").textContent).toBe(warning);
  });
});
