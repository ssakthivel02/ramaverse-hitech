import React, { type CSSProperties, type ReactNode } from "react";

export function FadeReveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return <div className={`motion-fade ${className}`} style={{ "--motion-delay": `${delay}ms` } as CSSProperties}>{children}</div>;
}

export function SacredGlow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`sacred-glow ${className}`}>{children}</div>;
}

export function JourneyPath({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`journey-path ${className}`}><span /><span /><span /><span /></div>;
}

export function KandaTransition({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`kanda-transition ${className}`}>{children}</section>;
}

export function SourceReveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`source-reveal ${className}`}>{children}</div>;
}

export function CharacterConnection({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`character-connection ${className}`}>{children}</div>;
}

export function TimelineReveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`timeline-reveal ${className}`}>{children}</div>;
}

export function ReaderPageTurn({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`reader-page-turn ${className}`}>{children}</div>;
}

export function AskThinkingState({ label = "Gathering grounded sources…" }: { label?: string }) {
  return <div role="status" aria-live="polite" className="ask-thinking-state"><span className="thinking-dot" /><span>{label}</span></div>;
}

export function LanguageTransition({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`language-transition ${className}`}>{children}</div>;
}
