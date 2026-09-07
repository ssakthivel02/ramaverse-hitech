import React from "react";

type ReviewStatusBadgeProps = {
  reviewStatus?: string | null;
};

export function ReviewStatusBadge({ reviewStatus }: ReviewStatusBadgeProps) {
  const status = reviewStatus ?? "needs_source_review";
  const isVerified = status === "source_verified";

  return (
    <span className={`inline-flex rounded-full border px-2 py-1 text-[10px] font-medium uppercase tracking-wide ${isVerified ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-200" : "border-amber-300/25 bg-amber-300/10 text-amber-200"}`}>
      Editorial review: {status.replaceAll("_", " ")}
    </span>
  );
}
