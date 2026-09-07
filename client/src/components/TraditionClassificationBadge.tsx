import React from "react";

type TraditionClassification = "VERIFIED_CANONICAL" | "SOURCE_ACQUIRED" | "TRADITIONAL" | "LATER_TEXT" | "REGIONAL" | "EDITORIAL_APPLICATION" | "NOT_PUBLISHED";

const styles: Record<TraditionClassification, string> = {
  VERIFIED_CANONICAL: "border-emerald-300/30 bg-emerald-300/10 text-emerald-100",
  SOURCE_ACQUIRED: "border-sky-300/30 bg-sky-300/10 text-sky-100",
  TRADITIONAL: "border-violet-300/30 bg-violet-300/10 text-violet-100",
  LATER_TEXT: "border-amber-300/30 bg-amber-300/10 text-amber-100",
  REGIONAL: "border-rose-300/30 bg-rose-300/10 text-rose-100",
  EDITORIAL_APPLICATION: "border-[#d4af37]/30 bg-[#d4af37]/10 text-[#f3e9d2]",
  NOT_PUBLISHED: "border-white/15 bg-white/5 text-[#f3e9d2]/70",
};

export function TraditionClassificationBadge({ classification }: { classification: TraditionClassification }) {
  return <span className={`inline-flex rounded-full border px-2 py-1 text-[10px] font-medium uppercase tracking-wide ${styles[classification]}`}>{classification.replaceAll("_", " ")}</span>;
}
