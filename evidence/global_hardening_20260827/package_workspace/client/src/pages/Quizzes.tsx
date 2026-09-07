import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { RamaNavbar } from "@/components/RamaNavbar";
import { RamaFooter } from "@/components/RamaFooter";
import { Award, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReviewStatusBadge } from "@/components/ReviewStatusBadge";

export default function Quizzes() {
  const [difficulty, setDifficulty] = useState("All");
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState<Record<number, boolean>>({});

  const { data: quizzesList, isLoading } = trpc.ramaverse.getQuizzes.useQuery({
    difficulty: difficulty !== "All" ? difficulty : undefined,
  });

  const difficulties = ["All", "Easy", "Medium", "Hard"];

  const handleSelectOption = (quizId: number, optionIndex: number) => {
    setSelectedAnswers(prev => ({ ...prev, [quizId]: optionIndex }));
    setShowResults(prev => ({ ...prev, [quizId]: true }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b101b] text-[#f3e9d2]">
      <RamaNavbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] text-xs font-semibold mb-4 uppercase tracking-wider">
            <Award className="w-3.5 h-3.5" />
            Interactive Ramayana Knowledge Tests
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold gold-gradient-text mb-4">
            100 Quizzes & Challenges
          </h1>
          <p className="text-[#f3e9d2]/70 max-w-2xl mx-auto text-base">
            Test your knowledge with multiple-choice questions, instant scoring, and detailed canonical explanations across multiple difficulty levels.
          </p>
        </div>

        {/* Difficulty Filter */}
        <div className="flex justify-center gap-2 mb-12">
          {difficulties.map((diff) => (
            <Button
              key={diff}
              variant={difficulty === diff ? "default" : "outline"}
              onClick={() => setDifficulty(diff)}
              className={`text-xs ${difficulty === diff ? 'bg-[#d4af37] text-[#0b101b] font-bold' : 'border-[#d4af37]/30 text-[#f3e9d2] hover:bg-[#d4af37]/10'}`}
            >
              {diff} Difficulty
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-[#d4af37]">Loading 100 quizzes...</div>
        ) : (
          <div className="space-y-8">
            {quizzesList?.map((q) => {
              const options = Array.isArray(q.options) ? (q.options as string[]) : ["Sri Rama", "Lakshmana", "Hanuman", "Ravana"];
              const userChoice = selectedAnswers[q.id];
              const isAnswered = showResults[q.id];
              const isCorrect = userChoice === q.correctAnswerIndex;

              return (
                <div key={q.id} className="temple-card rounded-2xl p-6 sm:p-8 border border-[#d4af37]/20 space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#d4af37] font-semibold uppercase tracking-wider">Quiz Question #{q.quizNumber}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#1e3a8a]/40 border border-[#3b82f6]/30 text-[#f3e9d2]">
                        {q.difficulty}
                      </span>
                      <span className="text-xs text-[#f3e9d2]/60">{q.kandaReference}</span>
                      <ReviewStatusBadge reviewStatus={q.reviewStatus} />
                    </div>
                  </div>

                  <h3 className="font-serif text-xl font-bold text-[#f3e9d2]">{q.question}</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {options.map((opt, idx) => {
                      let btnStyle = "border-[#d4af37]/30 bg-[#0b101b]/60 hover:bg-[#162032] text-[#f3e9d2]";
                      if (isAnswered) {
                        if (idx === q.correctAnswerIndex) {
                          btnStyle = "border-green-500 bg-green-500/20 text-green-300 font-semibold";
                        } else if (idx === userChoice) {
                          btnStyle = "border-red-500 bg-red-500/20 text-red-300";
                        }
                      }

                      return (
                        <button
                          key={idx}
                          disabled={isAnswered}
                          onClick={() => handleSelectOption(q.id, idx)}
                          className={`p-4 rounded-xl border text-left text-sm transition-all flex items-center justify-between ${btnStyle}`}
                        >
                          <span>{opt}</span>
                          {isAnswered && idx === q.correctAnswerIndex && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                          {isAnswered && idx === userChoice && idx !== q.correctAnswerIndex && <XCircle className="w-4 h-4 text-red-400" />}
                        </button>
                      );
                    })}
                  </div>

                  {isAnswered && (
                    <div className={`p-4 rounded-xl border text-xs space-y-2 ${isCorrect ? 'bg-green-950/30 border-green-500/30 text-green-200' : 'bg-amber-950/30 border-amber-500/30 text-amber-200'}`}>
                      <p className="font-semibold">{isCorrect ? "Correct! Excellent understanding." : "Incorrect. Review the correct option above."}</p>
                      <p className="text-[#f3e9d2]/80">{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      <RamaFooter />
    </div>
  );
}
