import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { RamaNavbar } from "@/components/RamaNavbar";
import { RamaFooter } from "@/components/RamaFooter";
import { Smile, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ReviewStatusBadge } from "@/components/ReviewStatusBadge";

export default function Stories() {
  const [search, setSearch] = useState("");

  const { data: storiesList, isLoading } = trpc.ramaverse.getStories.useQuery({
    search: search.trim() ? search : undefined,
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#0b101b] text-[#f3e9d2]">
      <RamaNavbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] text-xs font-semibold mb-4 uppercase tracking-wider">
            <Smile className="w-3.5 h-3.5" />
            Illustrated Moral Tales for Children
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold gold-gradient-text mb-4">
            30 Kids Stories
          </h1>
          <p className="text-[#f3e9d2]/70 max-w-2xl mx-auto text-base">
            Simplified, engaging story cards retelling enchanting Ramayana episodes, designed for children of all ages.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-[#d4af37]" />
            <Input
              type="text"
              placeholder="Search kids stories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-[#162032] border-[#d4af37]/30 text-[#f3e9d2] placeholder:text-[#f3e9d2]/40"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-[#d4af37]">Loading 30 kids stories...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {storiesList?.map((s) => (
              <div key={s.id} className="temple-card rounded-2xl p-6 border border-[#d4af37]/20 flex flex-col justify-between hover:border-[#d4af37]/50 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-[#d4af37] font-semibold uppercase tracking-wider">Story #{s.storyNumber}</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#1e3a8a]/40 border border-[#3b82f6]/30 text-[#f3e9d2]">
                      {s.ageGroup}
                    </span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#f3e9d2] mb-3">{s.title}</h3>
                  <p className="text-xs text-[#f3e9d2]/80 leading-relaxed mb-4">{s.content}</p>
                  <ReviewStatusBadge reviewStatus={s.reviewStatus} />
                </div>
                <div className="border-t border-white/10 pt-4 mt-2">
                  <p className="text-[11px] text-[#d4af37] font-semibold italic">Moral: {s.moral}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <RamaFooter />
    </div>
  );
}
