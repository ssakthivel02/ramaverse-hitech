import React, { createContext, useContext, useEffect, useState } from "react";
import { isBookmark, isJournalNote, isLibraryBackup, isReadingProgress } from "../lib/libraryBackup";

export type BookmarkItem = {
  id: string;
  type: "wisdom" | "character" | "place" | "kanda" | "story" | "guidance" | "sarga";
  itemId: number | string;
  title: string;
  timestamp: number;
};

export type JournalNote = { id: string; title: string; content: string; timestamp: number };
export type ReadingProgress = { recordKey: string; updatedAt: number };

interface LibraryContextType {
  bookmarks: BookmarkItem[];
  addBookmark: (item: Omit<BookmarkItem, "id" | "timestamp">) => void;
  removeBookmark: (itemId: number | string, type: string) => void;
  isBookmarked: (itemId: number | string, type: string) => boolean;
  journalNotes: JournalNote[];
  addJournalNote: (title: string, content: string) => void;
  deleteJournalNote: (id: string) => void;
  exportData: () => void;
  importData: (jsonStr: string) => boolean;
  clearAllData: () => void;
  readingProgress: ReadingProgress[];
  storageFailed: boolean;
  markSargaRead: (recordKey: string) => void;
  markSargaUnread: (recordKey: string) => void;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

function loadLocal<T>(key: string, validate: (value: unknown) => value is T): { value: T[]; unreadable: boolean } {
  try {
    const saved = localStorage.getItem(key);
    if (saved === null) return { value: [], unreadable: false };
    const parsed: unknown = JSON.parse(saved);
    if (Array.isArray(parsed) && parsed.every(validate)) return { value: parsed, unreadable: false };
  } catch { /* Preserve unreadable storage until an explicit restore or clear. */ }
  return { value: [], unreadable: true };
}

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const [loaded] = useState(() => ({
    ramaverse_bookmarks: loadLocal("ramaverse_bookmarks", isBookmark),
    ramaverse_journal: loadLocal("ramaverse_journal", isJournalNote),
    ramaverse_sarga_progress: loadLocal("ramaverse_sarga_progress", isReadingProgress),
  }));
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(loaded.ramaverse_bookmarks.value);
  const [journalNotes, setJournalNotes] = useState<JournalNote[]>(loaded.ramaverse_journal.value);
  const [readingProgress, setReadingProgress] = useState<ReadingProgress[]>(loaded.ramaverse_sarga_progress.value);
  const [unreadableKeys, setUnreadableKeys] = useState(() =>
    Object.entries(loaded).filter(([, collection]) => collection.unreadable).map(([key]) => key));

  const [storageFailed, setStorageFailed] = useState(false);

  useEffect(() => {
    const records: [string, unknown][] = [
      ["ramaverse_bookmarks", bookmarks],
      ["ramaverse_journal", journalNotes],
      ["ramaverse_sarga_progress", readingProgress],
    ];
    let failed = false;
    for (const [key, value] of records) {
      if (unreadableKeys.includes(key)) continue;
      try { localStorage.setItem(key, JSON.stringify(value)); } catch { failed = true; }
    }
    setStorageFailed(failed);
  }, [bookmarks, journalNotes, readingProgress, unreadableKeys]);

  const isBookmarked = (itemId: number | string, type: string) => bookmarks.some(bookmark => bookmark.itemId === itemId && bookmark.type === type);
  const addBookmark = (item: Omit<BookmarkItem, "id" | "timestamp">) => {
    if (isBookmarked(item.itemId, item.type)) return;
    setBookmarks(previous => [{ ...item, id: `${item.type}_${item.itemId}_${Date.now()}`, timestamp: Date.now() }, ...previous]);
  };
  const removeBookmark = (itemId: number | string, type: string) => setBookmarks(previous => previous.filter(bookmark => !(bookmark.itemId === itemId && bookmark.type === type)));
  const addJournalNote = (title: string, content: string) => setJournalNotes(previous => [{ id: `note_${Date.now()}`, title: title || "Spiritual Reflection", content, timestamp: Date.now() }, ...previous]);
  const deleteJournalNote = (id: string) => setJournalNotes(previous => previous.filter(note => note.id !== id));
  const markSargaRead = (recordKey: string) => setReadingProgress(previous => [{ recordKey, updatedAt: Date.now() }, ...previous.filter(item => item.recordKey !== recordKey)]);
  const markSargaUnread = (recordKey: string) => setReadingProgress(previous => previous.filter(item => item.recordKey !== recordKey));

  const exportData = () => {
    const data = { bookmarks, journalNotes, readingProgress, version: 2, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `ramaverse_backup_${Date.now()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const importData = (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (isLibraryBackup(parsed)) {
        setBookmarks(parsed.bookmarks);
        setJournalNotes(parsed.journalNotes);
        if (Array.isArray(parsed.readingProgress)) setReadingProgress(parsed.readingProgress);
        setUnreadableKeys(previous => previous.filter(key =>
          key === "ramaverse_sarga_progress" && parsed.readingProgress === undefined));
        return true;
      }
    } catch (error) {
      console.error("Import failed", error);
    }
    return false;
  };

  const clearAllData = () => {
    setUnreadableKeys([]);
    setBookmarks([]);
    setJournalNotes([]);
    setReadingProgress([]);
    for (const key of ["ramaverse_bookmarks", "ramaverse_journal", "ramaverse_sarga_progress"]) {
      try { localStorage.removeItem(key); } catch { setStorageFailed(true); }
    }
  };

  return <LibraryContext.Provider value={{ bookmarks, addBookmark, removeBookmark, isBookmarked, journalNotes, addJournalNote, deleteJournalNote, exportData, importData, clearAllData, readingProgress, storageFailed, markSargaRead, markSargaUnread }}>
    {unreadableKeys.length > 0 && <p role="alert" className="m-0 border-b border-amber-400/30 bg-amber-950 px-4 py-3 text-center text-sm text-amber-100">Some saved library data could not be read and has been left unchanged. Changes to affected collections will not be saved until you restore a valid backup or clear the library. Export a backup of this session before leaving.</p>}
    {storageFailed && <p role="alert" className="m-0 border-b border-amber-400/30 bg-amber-950 px-4 py-3 text-center text-sm text-amber-100">Browser storage could not save your library changes. Changes may not survive a reload. Export a backup before leaving.</p>}
    {children}
  </LibraryContext.Provider>;
}

export function useLibrary() {
  const context = useContext(LibraryContext);
  if (!context) throw new Error("useLibrary must be used within a LibraryProvider");
  return context;
}
