// @vitest-environment node
import { describe, expect, it } from "vitest";
import { isLibraryBackup } from "./libraryBackup";

const bookmark = { id: "b1", type: "sarga", itemId: "fixture", title: "Bookmark", timestamp: 1 };
const note = { id: "n1", title: "Journal", content: "Reflection", timestamp: 1 };
const progress = { recordKey: "fixture", updatedAt: 1 };
const valid = { bookmarks: [bookmark], journalNotes: [note], readingProgress: [progress], version: 2 };

describe("Library backup entry validation", () => {
  it("accepts the exported format and all supported bookmark kinds", () => {
    expect(isLibraryBackup(valid)).toBe(true);
    for (const type of ["wisdom", "character", "place", "kanda", "story", "guidance", "sarga"]) {
      expect(isLibraryBackup({ ...valid, bookmarks: [{ ...bookmark, type, itemId: 12 }] })).toBe(true);
    }
  });

  it("accepts legacy backups without reading progress and valid empty collections", () => {
    expect(isLibraryBackup({ bookmarks: [bookmark], journalNotes: [note], version: 1 })).toBe(true);
    expect(isLibraryBackup({ bookmarks: [], journalNotes: [], readingProgress: [] })).toBe(true);
  });

  it.each([
    ["null root", null],
    ["missing collection", { bookmarks: [] }],
    ["null bookmark", { ...valid, bookmarks: [null] }],
    ["missing bookmark field", { ...valid, bookmarks: [{ type: "sarga" }] }],
    ["unknown bookmark kind", { ...valid, bookmarks: [{ ...bookmark, type: "unsupported" }] }],
    ["object item identity", { ...valid, bookmarks: [{ ...bookmark, itemId: {} }] }],
    ["object bookmark title", { ...valid, bookmarks: [{ ...bookmark, title: {} }] }],
    ["nonfinite bookmark time", { ...valid, bookmarks: [{ ...bookmark, timestamp: Infinity }] }],
    ["null journal entry", { ...valid, journalNotes: [null] }],
    ["object journal content", { ...valid, journalNotes: [{ ...note, content: {} }] }],
    ["string journal time", { ...valid, journalNotes: [{ ...note, timestamp: "1" }] }],
    ["null progress collection", { ...valid, readingProgress: null }],
    ["null progress entry", { ...valid, readingProgress: [null] }],
    ["object progress identity", { ...valid, readingProgress: [{ ...progress, recordKey: {} }] }],
    ["nonfinite progress time", { ...valid, readingProgress: [{ ...progress, updatedAt: NaN }] }],
  ])("rejects %s before any restore", (_label, backup) => {
    expect(isLibraryBackup(backup)).toBe(false);
  });
});
