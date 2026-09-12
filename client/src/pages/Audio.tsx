import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { RamaNavbar } from "@/components/RamaNavbar";
import { RamaFooter } from "@/components/RamaFooter";
import { Headphones, Search, Clock, Music, Play, Pause, Square, Volume2, ShieldAlert } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ReviewStatusBadge } from "@/components/ReviewStatusBadge";

export default function Audio() {
  const [search, setSearch] = useState("");
  const [activeSpeechId, setActiveSpeechId] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const { data: audioList, isLoading, error } = trpc.ramaverse.getAudioScripts.useQuery({
    search: search.trim() ? search : undefined,
  });

  const handlePlaySpeech = (id: number, text: string) => {
    if (!('speechSynthesis' in window)) {
      alert("Speech synthesis is not supported in this browser.");
      return;
    }

    if (activeSpeechId === id && isPlaying) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
      return;
    }

    if (activeSpeechId === id && !isPlaying) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.onend = () => {
      setIsPlaying(false);
      setActiveSpeechId(null);
    };
    window.speechSynthesis.speak(utterance);
    setActiveSpeechId(id);
    setIsPlaying(true);
  };

  const handleStopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setActiveSpeechId(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b101b] text-[#f3e9d2]">
      <RamaNavbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] text-xs font-semibold uppercase tracking-wider mb-4">
            <Headphones className="w-3.5 h-3.5" />
            Sacred Acoustic Library
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold gold-gradient-text mb-4">Devotional Audio Scripts</h1>
          <p className="text-[#f3e9d2]/75 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Immerse yourself in source-grounded narrations, contemplative chanting rhythms, and epic storytelling scripts across the Seven Kandas.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-[#162032]/70 p-4 rounded-2xl border border-[#d4af37]/20">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#d4af37]/60" />
            <Input
              placeholder="Search narration scripts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-[#0b101b] border-[#d4af37]/30 text-[#f3e9d2] placeholder:text-[#f3e9d2]/40"
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-[#d4af37]">
            <Volume2 className="w-4 h-4" /> Web Speech API Reader Enabled
          </div>
        </div>

        <div className="mb-8 rounded-2xl border border-amber-300/25 bg-amber-300/5 p-4 text-xs text-amber-200/90 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
          <p>
            Audio narration scripts use synthesized browser speech. Traditional devotion and chanting practices are observed respectfully without supernatural or medical outcome guarantees.
          </p>
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-[#d4af37]">Loading sacred audio transcripts...</div>
        ) : error ? (
          <div role="alert" className="py-20 text-center text-rose-200">Audio scripts could not be loaded. Please try again.</div>
        ) : audioList && audioList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {audioList.map((a) => {
              const isThisPlaying = activeSpeechId === a.scriptNumber && isPlaying;
              const displayText = a.scriptContent || a.transcript;
              return (
                <div key={a.id} className="temple-card rounded-2xl p-6 border border-[#d4af37]/20 flex flex-col justify-between hover:border-[#d4af37]/50 transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs text-[#d4af37] font-semibold uppercase tracking-wider">Script #{a.scriptNumber}</span>
                      <div className="flex items-center gap-3 text-xs text-[#f3e9d2]/70">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-[#d4af37]" /> {a.durationMinutes}m</span>
                      </div>
                    </div>
                    <h3 className="font-serif text-lg font-bold text-[#f3e9d2] mb-2">{a.title}</h3>
                    <p className="text-xs text-[#d4af37] font-medium mb-3">Narrator: {a.narratorRole || "Sutradhar"}</p>
                    <div className="mb-3"><ReviewStatusBadge reviewStatus={a.reviewStatus} /></div>
                    <div className="bg-[#0b101b]/80 border border-[#d4af37]/20 rounded-xl p-4 text-xs font-mono text-[#f3e9d2]/80 whitespace-pre-line mb-4 max-h-40 overflow-y-auto">
                      {displayText}
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-4 mt-2 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[#d4af37] flex items-center gap-1">
                        <Music className="w-3 h-3" /> {a.musicalMood || "Devotional"}
                      </span>
                      <span className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded">
                        Synthetic device narration
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handlePlaySpeech(a.scriptNumber, displayText)}
                        className="flex-1 text-xs bg-[#d4af37] text-[#0b101b] font-bold hover:bg-[#d4af37]/90"
                      >
                        {isThisPlaying ? <Pause className="w-3.5 h-3.5 mr-1.5" /> : <Play className="w-3.5 h-3.5 mr-1.5" />}
                        {isThisPlaying ? "Pause Audio" : "Play Narration"}
                      </Button>
                      {activeSpeechId === a.scriptNumber && (
                        <Button
                          variant="outline"
                          onClick={handleStopSpeech}
                          className="text-xs border-red-500/30 text-red-400 hover:bg-red-500/10"
                        >
                          <Square className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center text-[#f3e9d2]/60">No audio scripts matching your search were found.</div>
        )}
      </main>
      <RamaFooter />
    </div>
  );
}
