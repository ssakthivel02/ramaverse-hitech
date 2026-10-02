import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { LibraryProvider, useLibrary, type BookmarkItem } from "./LibraryContext";

const fixture: BookmarkItem = { id: "seed", type: "sarga", itemId: "fixture", title: "Restored bookmark", timestamp: 1 };
function Probe() {
  const library = useLibrary();
  return <>
    <button onClick={() => {
      library.addBookmark({ type: "sarga", itemId: "fixture", title: "First request" });
      library.addBookmark({ type: "sarga", itemId: "fixture", title: "Second request" });
      library.addBookmark({ type: "sarga", itemId: "fixture", title: "Third request" });
    }}>Add repeated</button>
    <button onClick={() => {
      library.addBookmark({ type: "sarga", itemId: "fixture", title: "Sarga" });
      library.addBookmark({ type: "wisdom", itemId: "fixture", title: "Wisdom" });
      library.addBookmark({ type: "sarga", itemId: 1, title: "Numeric" });
      library.addBookmark({ type: "sarga", itemId: "1", title: "String" });
    }}>Add distinct</button>
    <button onClick={() => {
      library.removeBookmark("fixture", "sarga");
      library.addBookmark({ type: "sarga", itemId: "fixture", title: "Re-added bookmark" });
    }}>Remove then add</button>
    <button onClick={() => {
      library.importData(JSON.stringify({ bookmarks: [fixture], journalNotes: [], readingProgress: [] }));
      library.addBookmark({ type: "sarga", itemId: "fixture", title: "Duplicate after restore" });
    }}>Restore then add</button>
    <output data-testid="bookmarks">{JSON.stringify(library.bookmarks)}</output>
    <output data-testid="bookmarked">{String(library.isBookmarked("fixture", "sarga"))}</output>
  </>;
}
const bookmarks = () => JSON.parse(screen.getByTestId("bookmarks").textContent || "[]") as BookmarkItem[];
const persisted = () => JSON.parse(localStorage.getItem("ramaverse_bookmarks") || "[]") as BookmarkItem[];

describe("Bookmark additions use the latest queued state", () => {
  afterEach(() => { cleanup(); vi.restoreAllMocks(); localStorage.clear(); });

  it("keeps one bookmark when the same identity is added repeatedly in one event", () => {
    render(<LibraryProvider><Probe /></LibraryProvider>);
    fireEvent.click(screen.getByRole("button", { name: "Add repeated" }));
    expect(bookmarks()).toHaveLength(1);
    expect(bookmarks()[0].title).toBe("First request");
    expect(persisted()).toEqual(bookmarks());
    expect(screen.getByTestId("bookmarked").textContent).toBe("true");
  });

  it("retains distinct kinds and the existing numeric/string identity distinction", () => {
    vi.spyOn(Date, "now").mockReturnValue(1000);
    render(<LibraryProvider><Probe /></LibraryProvider>);
    fireEvent.click(screen.getByRole("button", { name: "Add distinct" }));
    expect(bookmarks()).toHaveLength(4);
    expect(new Set(bookmarks().map(item => item.id)).size).toBe(4);
    expect(bookmarks().map(item => item.title)).toEqual(["String", "Numeric", "Wisdom", "Sarga"]);
    expect(persisted()).toEqual(bookmarks());
  });

  it("allows a remove and re-add in the same event without discarding the new request", () => {
    localStorage.setItem("ramaverse_bookmarks", JSON.stringify([fixture]));
    render(<LibraryProvider><Probe /></LibraryProvider>);
    fireEvent.click(screen.getByRole("button", { name: "Remove then add" }));
    expect(bookmarks()).toHaveLength(1);
    expect(bookmarks()[0].title).toBe("Re-added bookmark");
    expect(persisted()).toEqual(bookmarks());
    expect(screen.getByTestId("bookmarked").textContent).toBe("true");
  });

  it("does not add a duplicate after an earlier queued restore introduces that identity", () => {
    render(<LibraryProvider><Probe /></LibraryProvider>);
    fireEvent.click(screen.getByRole("button", { name: "Restore then add" }));
    expect(bookmarks()).toEqual([fixture]);
    expect(persisted()).toEqual([fixture]);
  });
});
