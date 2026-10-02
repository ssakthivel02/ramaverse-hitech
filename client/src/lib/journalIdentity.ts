import type { JournalNote } from "../contexts/LibraryContext";

// Retain every note; only later occurrences of an already used ID need a new ID.
export function uniqueJournalNoteIds(notes: JournalNote[]): JournalNote[] {
  const reserved = new Set(notes.map(note => note.id));
  const seen = new Set<string>();
  let changed = false;
  const result = notes.map(note => {
    if (!seen.has(note.id)) {
      seen.add(note.id);
      return note;
    }
    let suffix = 1;
    let id = `${note.id}_${suffix}`;
    while (reserved.has(id)) id = `${note.id}_${++suffix}`;
    reserved.add(id);
    seen.add(id);
    changed = true;
    return { ...note, id };
  });
  return changed ? result : notes;
}
