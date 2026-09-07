import { useState } from "react";
import { RamaNavbar } from "@/components/RamaNavbar";
import { RamaFooter } from "@/components/RamaFooter";
import { useLibrary } from "@/contexts/LibraryContext";
import { Bookmark, BookOpen, Download, Trash2, Edit3, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function Library() {
  const { bookmarks, removeBookmark, journalNotes, addJournalNote, deleteJournalNote, exportData, clearAllData } = useLibrary();
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'journal'>('bookmarks');
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    addJournalNote(noteTitle, noteContent);
    setNoteTitle("");
    setNoteContent("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b101b] text-[#f3e9d2]">
      <RamaNavbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] text-xs font-semibold mb-4 uppercase tracking-wider">
            <Bookmark className="w-3.5 h-3.5" />
            Local-First Spiritual Workspace
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold gold-gradient-text mb-4">
            Library & Journal
          </h1>
          <p className="text-[#f3e9d2]/70 max-w-2xl mx-auto text-base">
            Your private device-local bookmarks, favorites, and spiritual reflections. Stored securely on your device only.
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
          <div className="flex gap-2">
            <Button
              variant={activeTab === 'bookmarks' ? 'default' : 'outline'}
              onClick={() => setActiveTab('bookmarks')}
              className={`text-xs ${activeTab === 'bookmarks' ? 'bg-[#d4af37] text-[#0b101b] font-bold' : 'border-[#d4af37]/30 text-[#f3e9d2]'}`}
            >
              Bookmarks ({bookmarks.length})
            </Button>
            <Button
              variant={activeTab === 'journal' ? 'default' : 'outline'}
              onClick={() => setActiveTab('journal')}
              className={`text-xs ${activeTab === 'journal' ? 'bg-[#d4af37] text-[#0b101b] font-bold' : 'border-[#d4af37]/30 text-[#f3e9d2]'}`}
            >
              Spiritual Journal ({journalNotes.length})
            </Button>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={exportData} className="text-xs border-[#d4af37]/30 text-[#d4af37] hover:bg-[#d4af37]/10">
              <Download className="w-3.5 h-3.5 mr-2" /> Export Backup
            </Button>
            <Button variant="outline" onClick={() => { if(confirm("Are you sure you want to clear all local library data?")) clearAllData(); }} className="text-xs border-red-500/30 text-red-400 hover:bg-red-500/10">
              <Trash2 className="w-3.5 h-3.5 mr-2" /> Clear All
            </Button>
          </div>
        </div>

        {activeTab === 'bookmarks' ? (
          bookmarks.length === 0 ? (
            <div className="text-center py-24 temple-card rounded-2xl border border-[#d4af37]/20">
              <Bookmark className="w-12 h-12 text-[#d4af37]/40 mx-auto mb-4" />
              <h3 className="font-serif text-xl font-bold text-[#f3e9d2] mb-2">No Bookmarks Saved Yet</h3>
              <p className="text-xs text-[#f3e9d2]/60 max-w-md mx-auto">
                Explore Wisdom records, Characters, Places, or Kandas and click bookmark to save them to your private library.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookmarks.map((b) => (
                <div key={b.id} className="temple-card rounded-2xl p-6 border border-[#d4af37]/20 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs uppercase px-2.5 py-0.5 rounded-full bg-[#1e3a8a]/40 text-[#f3e9d2] border border-[#3b82f6]/30">
                        {b.type}
                      </span>
                      <span className="text-[10px] text-[#f3e9d2]/50">{new Date(b.timestamp).toLocaleDateString()}</span>
                    </div>
                    <h3 className="font-serif text-lg font-bold text-[#f3e9d2] mb-3">{b.title}</h3>
                  </div>
                  <div className="border-t border-white/10 pt-4 mt-2 flex justify-end">
                    <Button variant="ghost" size="sm" onClick={() => removeBookmark(b.itemId, b.type)} className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10">
                      <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* New Note Form */}
            <div className="temple-card rounded-2xl p-6 border border-[#d4af37]/30 h-fit">
              <h3 className="font-serif text-xl font-bold text-[#d4af37] mb-4 flex items-center gap-2">
                <Edit3 className="w-5 h-5" /> New Reflection
              </h3>
              <form onSubmit={handleAddNote} className="space-y-4">
                <div>
                  <label className="block text-xs text-[#f3e9d2]/70 mb-1">Title</label>
                  <Input
                    type="text"
                    placeholder="e.g., Reflections on Surrender"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    className="bg-[#0b101b] border-[#d4af37]/30 text-[#f3e9d2]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#f3e9d2]/70 mb-1">Spiritual Note</label>
                  <Textarea
                    placeholder="Write your reflection here..."
                    rows={5}
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    className="bg-[#0b101b] border-[#d4af37]/30 text-[#f3e9d2]"
                  />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-[#d4af37] to-[#b45309] text-[#0b101b] font-semibold">
                  <Plus className="w-4 h-4 mr-2" /> Save Note Locally
                </Button>
              </form>
            </div>

            {/* Notes List */}
            <div className="lg:col-span-2 space-y-4">
              {journalNotes.length === 0 ? (
                <div className="text-center py-24 temple-card rounded-2xl border border-[#d4af37]/20">
                  <BookOpen className="w-12 h-12 text-[#d4af37]/40 mx-auto mb-4" />
                  <h3 className="font-serif text-xl font-bold text-[#f3e9d2] mb-2">No Spiritual Reflections Yet</h3>
                  <p className="text-xs text-[#f3e9d2]/60 max-w-md mx-auto">
                    Use the form on the left to record your private personal journal entries and spiritual notes.
                  </p>
                </div>
              ) : (
                journalNotes.map((n) => (
                  <div key={n.id} className="temple-card rounded-2xl p-6 border border-[#d4af37]/20">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-serif text-lg font-bold text-[#f3e9d2]">{n.title}</h3>
                      <span className="text-[10px] text-[#f3e9d2]/50">{new Date(n.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-[#f3e9d2]/80 leading-relaxed whitespace-pre-wrap mb-4">{n.content}</p>
                    <div className="border-t border-white/10 pt-3 flex justify-end">
                      <Button variant="ghost" size="sm" onClick={() => deleteJournalNote(n.id)} className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10">
                        <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      <RamaFooter />
    </div>
  );
}
