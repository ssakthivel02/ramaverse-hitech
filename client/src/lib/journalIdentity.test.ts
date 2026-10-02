// @vitest-environment node
import { describe, expect, it } from "vitest";
import { uniqueJournalNoteIds } from "./journalIdentity";

const note = (id: string, title: string) => ({ id, title, content: "Synthetic " + title, timestamp: 1 });

describe("Journal identity recovery preserves all note content", () => {
  it("leaves unique input and note references unchanged", () => {
    const original = [note("a", "First"), note("b", "Second")];
    expect(uniqueJournalNoteIds(original)).toBe(original);
    expect(uniqueJournalNoteIds([])).toEqual([]);
  });

  it("changes only duplicate IDs without mutating or dropping entries", () => {
    const original = [note("a", "First"), note("a", "Second"), note("a", "Third")];
    const before = structuredClone(original);
    const result = uniqueJournalNoteIds(original);
    expect(result.map(item => item.id)).toEqual(["a", "a_1", "a_2"]);
    expect(result.map(item => ({ title: item.title, content: item.content, timestamp: item.timestamp }))).toEqual(original.map(item => ({ title: item.title, content: item.content, timestamp: item.timestamp })));
    expect(original).toEqual(before);
    expect(result[0]).toBe(original[0]);
  });

  it("reserves unique suffixes even when they appear after duplicates", () => {
    const result = uniqueJournalNoteIds([note("a", "First"), note("a", "Second"), note("a_1", "Original suffix"), note("a", "Third")]);
    expect(result.map(item => item.id)).toEqual(["a", "a_2", "a_1", "a_3"]);
    expect(new Set(result.map(item => item.id)).size).toBe(4);
  });

  it("is stable when normalized records are loaded or restored again", () => {
    const recovered = uniqueJournalNoteIds([note("", "First"), note("", "Second"), note("_1", "Reserved")]);
    expect(recovered.map(item => item.id)).toEqual(["", "_2", "_1"]);
    expect(uniqueJournalNoteIds(recovered)).toBe(recovered);
    expect(uniqueJournalNoteIds(JSON.parse(JSON.stringify(recovered)))).toEqual(recovered);
  });
});
