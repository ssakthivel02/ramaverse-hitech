import type { BookmarkItem, JournalNote, ReadingProgress } from "../contexts/LibraryContext";

type LibraryBackup = {
  bookmarks: BookmarkItem[];
  journalNotes: JournalNote[];
  readingProgress?: ReadingProgress[];
};

const bookmarkTypes = new Set(["wisdom", "character", "place", "kanda", "story", "guidance", "sarga"]);
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

function isBookmark(value: unknown): value is BookmarkItem {
  return isRecord(value) && typeof value.id === "string"
    && typeof value.type === "string" && bookmarkTypes.has(value.type)
    && (typeof value.itemId === "string" || isFiniteNumber(value.itemId))
    && typeof value.title === "string" && isFiniteNumber(value.timestamp);
}

function isJournalNote(value: unknown): value is JournalNote {
  return isRecord(value) && typeof value.id === "string"
    && typeof value.title === "string" && typeof value.content === "string"
    && isFiniteNumber(value.timestamp);
}

function isReadingProgress(value: unknown): value is ReadingProgress {
  return isRecord(value) && typeof value.recordKey === "string" && isFiniteNumber(value.updatedAt);
}

// Validate every collection before the importer replaces any existing user data.
export function isLibraryBackup(value: unknown): value is LibraryBackup {
  return isRecord(value)
    && Array.isArray(value.bookmarks) && value.bookmarks.every(isBookmark)
    && Array.isArray(value.journalNotes) && value.journalNotes.every(isJournalNote)
    && (value.readingProgress === undefined
      || (Array.isArray(value.readingProgress) && value.readingProgress.every(isReadingProgress)));
}
