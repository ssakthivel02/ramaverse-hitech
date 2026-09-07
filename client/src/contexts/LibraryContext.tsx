import React, { createContext, useContext, useEffect, useState } from "react";

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
  markSargaRead: (recordKey: string) => void;
  markSargaUnread: (recordKey: string) => void;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

function loadLocal<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() => loadLocal("ramaverse_bookmarks", []));
  const [journalNotes, setJournalNotes] = useState<JournalNote[]>(() => loadLocal("ramaverse_journal", []));
  const [readingProgress, setReadingProgress] = useState<ReadingProgress[]>(() => loadLocal("ramaverse_sarga_progress", []));

  useEffect(() => { localStorage.setItem("ramaverse_bookmarks", JSON.stringify(bookmarks)); }, [bookmarks]);
  useEffect(() => { localStorage.setItem("ramaverse_journal", JSON.stringify(journalNotes)); }, [journalNotes]);
  useEffect(() => { localStorage.setItem("ramaverse_sarga_progress", JSON.stringify(readingProgress)); }, [readingProgress]);

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
      if (parsed && Array.isArray(parsed.bookmarks) && Array.isArray(parsed.journalNotes)) {
        setBookmarks(parsed.bookmarks);
        setJournalNotes(parsed.journalNotes);
        if (Array.isArray(parsed.readingProgress)) setReadingProgress(parsed.readingProgress);
        return true;
      }
    } catch (error) {
      console.error("Import failed", error);
    }
    return false;
  };

  const clearAllData = () => {
    setBookmarks([]);
    setJournalNotes([]);
    setReadingProgress([]);
    localStorage.removeItem("ramaverse_bookmarks");
    localStorage.removeItem("ramaverse_journal");
    localStorage.removeItem("ramaverse_sarga_progress");
  };

  return <LibraryContext.Provider value={{ bookmarks, addBookmark, removeBookmark, isBookmarked, journalNotes, addJournalNote, deleteJournalNote, exportData, importData, clearAllData, readingProgress, markSargaRead, markSargaUnread }}>{children}</LibraryContext.Provider>;
}

export function useLibrary() {
  const context = useContext(LibraryContext);
  if (!context) throw new Error("useLibrary must be used within a LibraryProvider");
  return context;
}
