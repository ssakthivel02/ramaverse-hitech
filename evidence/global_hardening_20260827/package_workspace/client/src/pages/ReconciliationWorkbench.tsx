import React from "react";
import { AlertTriangle, CheckCircle2, FileSearch, LockKeyhole, ShieldAlert } from "lucide-react";
import { RamaNavbar } from "@/components/RamaNavbar";
import { RamaFooter } from "@/components/RamaFooter";
import { trpc } from "@/lib/trpc";

const checks = [
  { label: "Schema validation", detail: "Required identifiers, Kanda range, Sarga identifier, summary, source ID, and tradition ID are checked before any candidate is eligible for review." },
  { label: "Duplicate & legacy overlap", detail: "Candidate keys are checked for duplicates and compared only against supplied canonical keys; potential overlaps stay unresolved." },
  { label: "Source & tradition registry", detail: "Candidate source and tradition identifiers must match the approved registry supplied with a future reconciled pack." },
  { label: "Editorial gates", detail: "Tamil-review and reconciliation states are surfaced as blockers. No workbench action can publish a candidate." },
];

export default function ReconciliationWorkbench() {
  const { data: preview, isLoading } = trpc.ramaverse.getReconciliationPreview.useQuery();
  const { data: sourceReview } = trpc.ramaverse.getSourceReviewPreview.useQuery();
  const [decisionFilter, setDecisionFilter] = React.useState("ALL");
  const candidateEvidence = (preview?.candidateEvidence ?? []) as Array<{ candidateId: string; recordType: string; kanda: string; sargaReference: string; sourceLocator: string; sourceIds: string[]; tradition: string; confidence: string; possibleCanonicalMatch: string; possibleLegacyOverlap: boolean; tamilReview: boolean; sourceReview: boolean; decisionState: string }>;
  const visibleCandidates = candidateEvidence.filter((candidate) => decisionFilter === "ALL" || candidate.decisionState === decisionFilter);
  return (
    <div className="min-h-screen bg-[#0b101b] text-[#f3e9d2]">
      <RamaNavbar />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-amber-300/35 bg-amber-300/5 p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">Editor / developer workbench</p>
              <h1 className="mt-2 font-serif text-3xl font-bold gold-gradient-text sm:text-4xl">Reconciliation preview</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[#f3e9d2]/75">This surface is intentionally non-publishing. It explains the dry-run pipeline that will inspect a reconciled staging pack without admitting records to the canonical production corpus.</p>
            </div>
            <span className="inline-flex w-fit items-center rounded-full border border-amber-300/35 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-amber-100"><ShieldAlert className="mr-1.5 h-3.5 w-3.5" />Under review — not canonical</span>
          </div>
        </div>

        <section className="mt-8" aria-live="polite">
          <h2 className="sr-only">Current dry-run state</h2>
          {isLoading ? <p className="rounded-xl border border-[#d4af37]/25 bg-[#101a2a] p-5 text-sm text-[#f3e9d2]/70">Loading dry-run state…</p> : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <article className="rounded-xl border border-[#d4af37]/20 bg-[#101a2a] p-5"><p className="text-[10px] uppercase tracking-[0.15em] text-[#d4af37]">Historical baseline</p><p className="mt-2 font-serif text-3xl text-[#f3e9d2]">{preview?.historicalCanonicalBaseline ?? 550}</p><p className="mt-1 text-xs text-[#f3e9d2]/55">Preserved reference; not recomputed here</p></article>
              <article className="rounded-xl border border-amber-300/25 bg-amber-300/5 p-5"><p className="text-[10px] uppercase tracking-[0.15em] text-amber-200">Staging observed</p><p className="mt-2 font-serif text-3xl text-[#f3e9d2]">{preview?.stagingObserved ?? 0}</p><p className="mt-1 text-xs text-[#f3e9d2]/55">{preview?.rawStagingAttached ? "Attached for dry run only" : "Not attached to this release"}</p></article>
              <article className="rounded-xl border border-emerald-400/25 bg-emerald-400/5 p-5"><p className="text-[10px] uppercase tracking-[0.15em] text-emerald-200">Staging published</p><p className="mt-2 font-serif text-3xl text-[#f3e9d2]">{preview?.stagingPublished ?? 0}</p><p className="mt-1 text-xs text-[#f3e9d2]/55">Public canonical corpus unchanged</p></article>
              <article className="rounded-xl border border-[#d4af37]/20 bg-[#101a2a] p-5"><p className="text-[10px] uppercase tracking-[0.15em] text-[#d4af37]">Dry-run candidates</p><p className="mt-2 font-serif text-3xl text-[#f3e9d2]">{preview?.candidateNewCanonicalRecords ?? 0}</p><p className="mt-1 text-xs text-[#f3e9d2]/55">{preview?.reconciliationState?.replaceAll("_", " ")}</p></article>
            </div>
          )}
          {!isLoading && !preview?.rawStagingAttached && <p className="mt-4 rounded-lg border border-amber-300/25 bg-amber-300/5 px-4 py-3 text-xs leading-relaxed text-amber-100">The ledger records {preview?.stagingObserved ?? 0} observed staging records, but the authoritative raw input is not attached to this release. Record-level validation counts remain unavailable; production merged stays {preview?.stagingPublished ?? 0}.</p>}
          {!isLoading && preview?.rawStagingAttached && <aside className="mt-4 rounded-lg border border-amber-300/25 bg-amber-300/5 px-4 py-3 text-xs leading-relaxed text-amber-100" aria-label="Attached staging coverage">
            <strong className="font-semibold">Attached primary staging coverage:</strong> {preview.stagingCoverage ?? "Source-located coverage"}. {preview.verifiedAttachedRecords ?? preview.inputRecords ?? 0} records are visible here only as a dry-run scope. They remain under review, excluded from public search, and separate from the 550-record canonical baseline.
          </aside>}
        </section>

        {sourceReview?.evidenceAvailable && <section className="mt-8 rounded-2xl border border-sky-300/25 bg-sky-300/5 p-5" aria-labelledby="next-source-review-title">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-200">Next exact source verification point</p><h2 id="next-source-review-title" className="mt-1 font-serif text-xl text-[#f3e9d2]">{sourceReview.sargaIdentifier} — source acquired, not published</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-[#f3e9d2]/75">{sourceReview.englishEditorialDescriptor}</p></div><span className="w-fit rounded-full border border-sky-300/30 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-sky-100">{sourceReview.publicationStatus.replaceAll("_", " ")}</span></div>
          <dl className="mt-5 grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-4"><div><dt className="text-[#f3e9d2]/50">Edition</dt><dd className="mt-1 font-semibold text-[#f3e9d2]">{sourceReview.editionId}</dd></div><div><dt className="text-[#f3e9d2]/50">Tradition</dt><dd className="mt-1 font-semibold text-[#f3e9d2]">{sourceReview.traditionId}</dd></div><div><dt className="text-[#f3e9d2]/50">Tamil title</dt><dd className="mt-1 font-semibold text-amber-100">{sourceReview.tamilTitleStatus.replaceAll("_", " ")}</dd></div><div><dt className="text-[#f3e9d2]/50">Source text</dt><dd className="mt-1 font-semibold text-sky-100">{sourceReview.sourceTextStatus.replaceAll("_", " ")}</dd></div></dl>
          <p className="mt-4 rounded-lg border border-sky-300/20 bg-[#0b101b]/40 p-3 text-xs leading-relaxed text-sky-100">This is an acquisition note only. It does not alter the 550-record canonical baseline, the 28-record attached staging set, public search, or publication eligibility.</p>
        </section>}

        <section className="mt-8 rounded-2xl border border-[#d4af37]/20 bg-[#101a2a] p-5" aria-labelledby="dry-run-summary-title">
          <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.16em] text-[#d4af37]">Non-mutating report</p><h2 id="dry-run-summary-title" className="mt-1 font-serif text-xl text-[#f3e9d2]">Dry-run summary</h2></div><span className="text-xs text-amber-200">Production merged: {preview?.stagingPublished ?? 0}</span></div>
          <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[["Input", preview?.rawStagingAttached ? preview?.inputRecords : "Unavailable"], ["Valid", preview?.rawStagingAttached ? preview?.validRecords : "Unavailable"], ["Duplicates", preview?.rawStagingAttached ? preview?.duplicates : "Unavailable"], ["Potential legacy overlap", preview?.rawStagingAttached ? preview?.potentialLegacyOverlap : "Unavailable"], ["Tamil review required", preview?.rawStagingAttached ? preview?.tamilReviewRequired : "Unavailable"], ["Source review required", preview?.rawStagingAttached ? preview?.sourceReviewRequired : "Unavailable"], ["Schema errors", preview?.rawStagingAttached ? preview?.schemaErrors : "Unavailable"], ["Ready for editorial review", preview?.rawStagingAttached ? preview?.readyForEditorialReview : "Unavailable"], ["Production merged", preview?.stagingPublished ?? 0]].map(([label, value]) => <div key={String(label)} className="rounded-lg border border-white/10 bg-[#0b101b]/50 p-3"><dt className="text-[10px] uppercase tracking-[0.12em] text-[#f3e9d2]/55">{label}</dt><dd className="mt-1 font-serif text-lg text-[#f3e9d2]">{String(value)}</dd></div>)}
          </dl>
        </section>

        {!isLoading && preview?.rawStagingAttached && <section className="mt-8 rounded-2xl border border-amber-300/25 bg-amber-300/5 p-5" aria-labelledby="candidate-evidence-title">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-xs uppercase tracking-[0.16em] text-amber-200">Staging-only metadata</p><h2 id="candidate-evidence-title" className="mt-1 font-serif text-xl text-[#f3e9d2]">Candidate decision evidence</h2><p className="mt-2 max-w-3xl text-xs leading-relaxed text-[#f3e9d2]/65">This view exposes identifiers and review metadata only. It does not display excerpts, translations, or a publication action; candidates remain excluded from canonical search and release content.</p></div>
            <label className="text-xs text-[#f3e9d2]/70">Decision state <select aria-label="Filter staging candidates by decision state" value={decisionFilter} onChange={(event) => setDecisionFilter(event.target.value)} className="ml-2 rounded-md border border-amber-300/35 bg-[#0b101b] px-2 py-1 text-[#f3e9d2]"><option value="ALL">All states</option>{Object.keys(preview?.decisionStateCounts ?? {}).sort().map((state) => <option key={state} value={state}>{state.replaceAll("_", " ")}</option>)}</select></label>
          </div>
          <div className="mt-4 flex flex-wrap gap-2" aria-label="Candidate decision state counts">{Object.entries(preview?.decisionStateCounts ?? {}).sort(([left], [right]) => left.localeCompare(right)).map(([state, count]) => <span key={state} className="rounded-full border border-amber-300/25 bg-[#0b101b]/50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-amber-100">{state.replaceAll("_", " ")}: {String(count)}</span>)}</div>
          <div className="mt-5 overflow-x-auto"><table className="min-w-[980px] w-full text-left text-xs"><caption className="sr-only">Sanitized staging candidate reconciliation evidence</caption><thead className="border-b border-amber-300/20 text-[10px] uppercase tracking-[0.1em] text-amber-100"><tr><th className="p-2">Candidate</th><th className="p-2">Kanda / Sarga</th><th className="p-2">Type</th><th className="p-2">Locator</th><th className="p-2">Match / overlap</th><th className="p-2">Reviews</th><th className="p-2">Tradition / confidence</th><th className="p-2">Decision</th></tr></thead><tbody>{visibleCandidates.map((candidate) => <tr key={candidate.candidateId} className="border-b border-white/10 align-top text-[#f3e9d2]/75"><td className="p-2 font-mono text-[10px] text-amber-100">{candidate.candidateId}</td><td className="p-2">{candidate.kanda}<br /><span className="text-[#f3e9d2]/50">{candidate.sargaReference}</span></td><td className="p-2">{candidate.recordType}</td><td className="p-2 max-w-[200px]">{candidate.sourceLocator}<br /><span className="text-[10px] text-[#f3e9d2]/50">{candidate.sourceIds.join(", ")}</span></td><td className="p-2">{candidate.possibleCanonicalMatch.replaceAll("_", " ")}</td><td className="p-2">Tamil: {candidate.tamilReview ? "required" : "not recorded"}<br />Source: {candidate.sourceReview ? "required" : "not recorded"}</td><td className="p-2">{candidate.tradition}<br /><span className="text-[#f3e9d2]/50">{candidate.confidence}</span></td><td className="p-2 font-semibold text-amber-100">{candidate.decisionState.replaceAll("_", " ")}</td></tr>)}</tbody></table></div>
          {!visibleCandidates.length && <p className="mt-4 rounded-lg border border-dashed border-amber-300/25 p-3 text-xs text-amber-100">No candidate metadata matches this decision state.</p>}
        </section>}

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          {checks.map((check) => (
            <article key={check.label} className="rounded-xl border border-[#d4af37]/20 bg-[#101a2a] p-5">
              <FileSearch className="h-5 w-5 text-[#d4af37]" />
              <h2 className="mt-3 font-serif text-xl text-[#f3e9d2]">{check.label}</h2>
              <p className="mt-2 text-sm leading-6 text-[#f3e9d2]/65">{check.detail}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-3">
          <article className="rounded-xl border border-emerald-400/25 bg-emerald-400/5 p-5"><CheckCircle2 className="h-5 w-5 text-emerald-300" /><h2 className="mt-3 font-serif text-lg">Canonical production</h2><p className="mt-2 text-sm text-[#f3e9d2]/65">Existing published records remain unchanged. A dry run has no database mutation path.</p></article>
          <article className="rounded-xl border border-amber-300/25 bg-amber-300/5 p-5"><AlertTriangle className="h-5 w-5 text-amber-200" /><h2 className="mt-3 font-serif text-lg">Staging candidates</h2><p className="mt-2 text-sm text-[#f3e9d2]/65">{preview?.rawStagingAttached ? "Attached staging is limited to this workbench. It remains explicitly labeled as staging and excluded from public search." : "No raw staging payload is loaded in this release. Future candidates must remain explicitly labeled as staging and excluded from public search."}</p></article>
          <article className="rounded-xl border border-[#d4af37]/25 bg-[#101a2a] p-5"><LockKeyhole className="h-5 w-5 text-[#d4af37]" /><h2 className="mt-3 font-serif text-lg">Approval gate</h2><p className="mt-2 text-sm text-[#f3e9d2]/65">A human reconciliation report and an explicit canonical import approval are required before any separate import step can be considered.</p></article>
        </section>
      </main>
      <RamaFooter />
    </div>
  );
}
