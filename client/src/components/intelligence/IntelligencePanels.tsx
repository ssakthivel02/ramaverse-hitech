import React, { useEffect, useMemo, useState } from "react";
import { BookOpen, Check, CircleHelp, ExternalLink, Headphones, MapPin, Mic, Pause, Play, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GroundingProvenance, IntelligenceLocale, IntelligenceRecord } from "../../../../shared/intelligence";

const copy: Record<IntelligenceLocale, Record<string, string>> = {
  en: { evidence: "Evidence", related: "Related questions", characters: "Character context", places: "Place context", timeline: "Timeline context", sources: "Source context", simple: "Explain simply", children: "Explain for children", tamil: "Explain in Tamil", read: "Read aloud", pause: "Pause", listen: "Listen", unavailable: "This explanation is not present in the verified record.", offline: "Offline-safe: previously cached evidence only.", sourceUnavailable: "Source locator unavailable in this record." },
  ta: { evidence: "ஆதாரம்", related: "தொடர்புடைய கேள்விகள்", characters: "கதாபாத்திரச் சூழல்", places: "தலச் சூழல்", timeline: "காலவரிசைச் சூழல்", sources: "ஆதாரச் சூழல்", simple: "எளிமையாக விளக்குக", children: "குழந்தைகளுக்கான விளக்கம்", tamil: "தமிழில் விளக்கம்", read: "சத்தமாக வாசிக்க", pause: "இடைநிறுத்து", listen: "கேளுங்கள்", unavailable: "இந்த விளக்கம் சரிபார்க்கப்பட்ட பதிவில் இல்லை.", offline: "ஆஃப்லைன் பாதுகாப்பு: முன்பு சேமித்த ஆதாரம் மட்டுமே.", sourceUnavailable: "இந்தப் பதிவில் ஆதார இடம் இல்லை." },
  hi: { evidence: "साक्ष्य", related: "संबंधित प्रश्न", characters: "पात्र संदर्भ", places: "स्थान संदर्भ", timeline: "समयरेखा संदर्भ", sources: "स्रोत संदर्भ", simple: "सरल व्याख्या", children: "बच्चों के लिए व्याख्या", tamil: "तमिल में व्याख्या", read: "सुनें", pause: "रोकें", listen: "चलाएँ", unavailable: "यह व्याख्या सत्यापित रिकॉर्ड में उपलब्ध नहीं है।", offline: "ऑफ़लाइन सुरक्षा: केवल पहले से संचित साक्ष्य।", sourceUnavailable: "इस रिकॉर्ड में स्रोत लोकेटर उपलब्ध नहीं है।" },
  te: { evidence: "ఆధారం", related: "సంబంధిత ప్రశ్నలు", characters: "పాత్ర సందర్భం", places: "స్థల సందర్భం", timeline: "కాలక్రమ సందర్భం", sources: "మూల సందర్భం", simple: "సులభంగా వివరించండి", children: "పిల్లల కోసం వివరించండి", tamil: "తమిళంలో వివరించండి", read: "వినిపించండి", pause: "ఆపండి", listen: "వినండి", unavailable: "ఈ వివరణ ధృవీకరించిన రికార్డులో లేదు.", offline: "ఆఫ్‌లైన్ రక్షణ: ఇంతకు ముందు నిల్వ చేసిన ఆధారం మాత్రమే.", sourceUnavailable: "ఈ రికార్డులో మూల లొకేటర్ లేదు." },
  kn: { evidence: "ಸಾಕ್ಷ್ಯ", related: "ಸಂಬಂಧಿತ ಪ್ರಶ್ನೆಗಳು", characters: "ಪಾತ್ರೆಯ ಸಂದರ್ಭ", places: "ಸ್ಥಳದ ಸಂದರ್ಭ", timeline: "ಕಾಲರೇಖೆಯ ಸಂದರ್ಭ", sources: "ಮೂಲದ ಸಂದರ್ಭ", simple: "ಸರಳವಾಗಿ ವಿವರಿಸಿ", children: "ಮಕ್ಕಳಿಗಾಗಿ ವಿವರಿಸಿ", tamil: "ತಮಿಳಿನಲ್ಲಿ ವಿವರಿಸಿ", read: "ಓದಿ ಕೇಳಿಸಿ", pause: "ನಿಲ್ಲಿಸಿ", listen: "ಕೇಳಿ", unavailable: "ಈ ವಿವರಣೆ ಪರಿಶೀಲಿಸಿದ ದಾಖಲೆಯಲ್ಲಿ ಇಲ್ಲ.", offline: "ಆಫ್‌ಲೈನ್ ಸುರಕ್ಷತೆ: ಹಿಂದೆ ಸಂಗ್ರಹಿಸಿದ ಸಾಕ್ಷ್ಯ ಮಾತ್ರ.", sourceUnavailable: "ಈ ದಾಖಲೆಯಲ್ಲಿ ಮೂಲ ಲೊಕೇಟರ್ ಇಲ್ಲ." },
  ml: { evidence: "തെളിവ്", related: "ബന്ധപ്പെട്ട ചോദ്യങ്ങൾ", characters: "കഥാപാത്ര പശ്ചാത്തലം", places: "സ്ഥല പശ്ചാത്തലം", timeline: "കാലരേഖ പശ്ചാത്തലം", sources: "ഉറവിട പശ്ചാത്തലം", simple: "ലളിതമായി വിശദീകരിക്കുക", children: "കുട്ടികൾക്കായി വിശദീകരിക്കുക", tamil: "തമിഴിൽ വിശദീകരിക്കുക", read: "വായിച്ചു കേൾപ്പിക്കുക", pause: "നിർത്തുക", listen: "കേൾക്കുക", unavailable: "ഈ വിശദീകരണം പരിശോധിച്ച രേഖയിൽ ലഭ്യമല്ല.", offline: "ഓഫ്‌ലൈൻ സുരക്ഷ: മുമ്പ് ശേഖരിച്ച തെളിവുകൾ മാത്രം.", sourceUnavailable: "ഈ രേഖയിൽ ഉറവിട ലൊക്കേറ്റർ ലഭ്യമല്ല." },
};

function tx(locale: IntelligenceLocale | undefined, key: string) {
  return copy[locale ?? "en"][key] ?? copy.en[key];
}

export function SourceContext({ records, locale = "en" }: { records: IntelligenceRecord[]; locale?: IntelligenceLocale }) {
  return <section className="mt-4 rounded-xl border border-[#d7b45a]/20 bg-[#0b101b]/60 p-4" aria-labelledby="source-context-title"><h3 id="source-context-title" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.16em] text-[#d7b45a]"><BookOpen className="h-4 w-4" />{tx(locale, "sources")}</h3><div className="mt-3 space-y-2">{records.map((record) => <div key={record.recordId} className="flex flex-wrap items-center gap-2 text-xs text-[#f3e9d2]/75"><code className="text-[#d7b45a]">{record.recordId}</code><span>{record.kanda ?? "Kanda not recorded"}</span><span>{record.sarga ?? "Sarga not recorded"}</span>{record.sourceLocator ? <a className="inline-flex items-center gap-1 text-[#d7b45a] underline-offset-4 hover:underline" href={record.sourceLocator.startsWith("http") ? record.sourceLocator : undefined}>{record.sourceLocator}<ExternalLink className="h-3 w-3" /></a> : <span className="text-amber-200/70">{tx(locale, "sourceUnavailable")}</span>}<span className="rounded-full border border-emerald-300/20 px-2 py-0.5 text-[10px] uppercase text-emerald-200">{record.confidence}</span></div>)}</div></section>;
}

export function AskEvidencePanel({ answer, evidence, provenance, locale = "en" }: { answer: string; evidence: IntelligenceRecord[]; provenance: GroundingProvenance; locale?: IntelligenceLocale }) {
  return <section className="mt-4 rounded-xl border border-[#d7b45a]/25 bg-[#101a2a]/80 p-4" aria-label="Canonical answer provenance" aria-labelledby="ask-evidence-title"><div className="flex items-start justify-between gap-3"><div><h3 id="ask-evidence-title" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.16em] text-[#d7b45a]"><ShieldCheck className="h-4 w-4" />{tx(locale, "evidence")}</h3><p className="mt-2 text-sm leading-6 text-[#f3e9d2]/80">{answer}</p></div><span className="shrink-0 rounded-full border border-emerald-300/20 px-2 py-1 text-[10px] uppercase text-emerald-200">{provenance.confidence}</span></div><div className="mt-3 flex flex-wrap gap-2 text-[10px] text-[#f3e9d2]/55"><span>Published Canonical Corpus Only</span><span>Staging excluded</span><span>{provenance.recordIds.length} record(s)</span></div><SourceContext records={evidence} locale={locale} /></section>;
}

export function RelatedQuestions({ questions, onSelect, locale = "en" }: { questions: string[]; onSelect?: (question: string) => void; locale?: IntelligenceLocale }) {
  return <section className="mt-4" aria-labelledby="related-questions-title"><h3 id="related-questions-title" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.16em] text-[#d7b45a]"><CircleHelp className="h-4 w-4" />{tx(locale, "related")}</h3><div className="mt-2 flex flex-wrap gap-2">{questions.map((question) => <button type="button" key={question} onClick={() => onSelect?.(question)} className="rounded-full border border-[#d7b45a]/25 px-3 py-1.5 text-left text-xs text-[#f3e9d2]/75 transition hover:border-[#d7b45a]/60 hover:text-[#f4d98b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d7b45a]">{question}</button>)}</div></section>;
}

function ContextList({ title, icon: Icon, records }: { title: string; icon: typeof UserRound; records: IntelligenceRecord[] }) {
  return <section className="mt-4 rounded-xl border border-white/10 bg-[#0b101b]/45 p-4" aria-label={title}><h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.16em] text-[#d7b45a]"><Icon className="h-4 w-4" />{title}</h3><div className="mt-3 grid gap-2 sm:grid-cols-2">{records.length ? records.map((record) => <div key={record.recordId} className="rounded-lg border border-white/10 p-3"><div className="font-serif text-sm text-[#f3e9d2]">{record.title}</div><div className="mt-1 text-xs leading-5 text-[#f3e9d2]/60">{record.excerpt}</div><code className="mt-2 block text-[10px] text-[#d7b45a]">{record.recordId}</code></div>) : <p className="text-xs text-[#f3e9d2]/55">No directly linked canonical records were returned.</p>}</div></section>;
}

export function CharacterContext({ records, locale = "en" }: { records: IntelligenceRecord[]; locale?: IntelligenceLocale }) { return <ContextList title={tx(locale, "characters")} icon={UserRound} records={records} />; }
export function PlaceContext({ records, locale = "en" }: { records: IntelligenceRecord[]; locale?: IntelligenceLocale }) { return <ContextList title={tx(locale, "places")} icon={MapPin} records={records} />; }
export function TimelineContext({ records, locale = "en" }: { records: IntelligenceRecord[]; locale?: IntelligenceLocale }) { return <ContextList title={tx(locale, "timeline")} icon={Sparkles} records={records} />; }

export function SourceComparisonCard({ records, locale = "en" }: { records: IntelligenceRecord[]; locale?: IntelligenceLocale }) {
  return <section className="mt-4 rounded-xl border border-[#d7b45a]/15 bg-[#101a2a]/55 p-4" aria-label="Source comparison"><h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.16em] text-[#d7b45a]"><BookOpen className="h-4 w-4" />{tx(locale, "sources")} comparison</h3><div className="mt-3 grid gap-2 md:grid-cols-2">{records.slice(0, 4).map((record) => <article key={record.recordId} className="rounded-lg border border-white/10 p-3"><div className="flex items-center justify-between gap-2"><code className="text-[10px] text-[#d7b45a]">{record.recordId}</code><span className="text-[10px] uppercase text-emerald-200">{record.confidence}</span></div><p className="mt-2 text-xs leading-5 text-[#f3e9d2]/70">{record.excerpt}</p><p className="mt-2 text-[10px] text-[#f3e9d2]/45">{record.sourceLocator || tx(locale, "sourceUnavailable")}</p></article>)}{records.length < 2 && <p className="text-xs text-[#f3e9d2]/55">Comparison requires at least two canonical records.</p>}</div></section>;
}

export function ContextualReaderAssistant({ record, locale = "en" }: { record?: IntelligenceRecord; locale?: IntelligenceLocale }) {
  return <section className="mt-4 rounded-xl border border-[#d7b45a]/15 bg-[#0b101b]/50 p-4" aria-label="Contextual Reader assistant"><h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.16em] text-[#d7b45a]"><Sparkles className="h-4 w-4" />Reader context</h3><p className="mt-2 text-sm leading-6 text-[#f3e9d2]/70">{record ? `${record.title}: ${record.excerpt}` : tx(locale, "unavailable")}</p>{record && <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-[#f3e9d2]/50"><code className="text-[#d7b45a]">{record.recordId}</code><span>{record.kanda || "Kanda not recorded"}</span><span>{record.sarga || "Sarga not recorded"}</span></div>}</section>;
}

export function ExplanationCard({ title, text, locale = "en", icon = Sparkles }: { title: string; text?: string | null; locale?: IntelligenceLocale; icon?: typeof Sparkles }) {
  const Icon = icon;
  return <section className="mt-4 rounded-xl border border-[#d7b45a]/15 bg-[#0b101b]/50 p-4"><h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.16em] text-[#d7b45a]"><Icon className="h-4 w-4" />{title}</h3><p className="mt-2 text-sm leading-6 text-[#f3e9d2]/75">{text?.trim() || tx(locale, "unavailable")}</p></section>;
}
export function ExplainSimply({ text, locale = "en" }: { text?: string | null; locale?: IntelligenceLocale }) { return <ExplanationCard title={tx(locale, "simple")} text={text} locale={locale} />; }
export function ExplainForChildren({ text, locale = "en" }: { text?: string | null; locale?: IntelligenceLocale }) { return <ExplanationCard title={tx(locale, "children")} text={text} locale={locale} />; }
export function ExplainInTamil({ text, locale = "en" }: { text?: string | null; locale?: IntelligenceLocale }) { return <ExplanationCard title={tx(locale, "tamil")} text={text} locale={locale} />; }

export function ReadAloud({ text, locale = "en" }: { text: string; locale?: IntelligenceLocale }) {
  const [speaking, setSpeaking] = useState(false);
  useEffect(() => () => window.speechSynthesis?.cancel(), []);
  const available = typeof window !== "undefined" && "speechSynthesis" in window;
  const toggle = () => { if (!available) return; if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return; } const utterance = new SpeechSynthesisUtterance(text); utterance.lang = locale === "ta" ? "ta-IN" : locale === "hi" ? "hi-IN" : locale === "te" ? "te-IN" : locale === "kn" ? "kn-IN" : locale === "ml" ? "ml-IN" : "en-IN"; utterance.onend = () => setSpeaking(false); window.speechSynthesis.speak(utterance); setSpeaking(true); };
  return <Button type="button" variant="outline" size="sm" onClick={toggle} disabled={!available} aria-label={speaking ? tx(locale, "pause") : tx(locale, "read")} className="border-[#d7b45a]/25 text-[#d7b45a]">{speaking ? <Pause className="mr-2 h-4 w-4" /> : <Headphones className="mr-2 h-4 w-4" />}{speaking ? tx(locale, "pause") : tx(locale, "read")}</Button>;
}

type VoiceRecognition = { lang: string; onresult?: (event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void; onend?: () => void; start: () => void; stop: () => void };

type VoiceRecognitionWindow = Window & { SpeechRecognition?: new () => VoiceRecognition; webkitSpeechRecognition?: new () => VoiceRecognition };

export function VoiceInput({ onTranscript, locale = "en" }: { onTranscript: (value: string) => void; locale?: IntelligenceLocale }) {
  const [listening, setListening] = useState(false);
  const recognition = useMemo(() => { if (typeof window === "undefined") return null; const speechWindow = window as VoiceRecognitionWindow; const SpeechRecognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition; return SpeechRecognition ? new SpeechRecognition() : null; }, []);
  const toggle = () => { if (!recognition) return; if (listening) { recognition.stop(); setListening(false); return; } recognition.lang = locale === "ta" ? "ta-IN" : locale === "hi" ? "hi-IN" : locale === "te" ? "te-IN" : locale === "kn" ? "kn-IN" : locale === "ml" ? "ml-IN" : "en-IN"; recognition.onresult = (event) => onTranscript(event.results[0]?.[0]?.transcript ?? ""); recognition.onend = () => setListening(false); recognition.start(); setListening(true); };
  return <Button type="button" variant="outline" size="icon" onClick={toggle} disabled={!recognition} aria-label={listening ? "Stop voice input" : "Start voice input"} className="border-[#d7b45a]/25 text-[#d7b45a]"><Mic className={listening ? "h-4 w-4 animate-pulse" : "h-4 w-4"} /></Button>;
}
