import type { IntelligenceAnswer } from "../../../shared/intelligence";

const CACHE_PREFIX = "ramaverse:intelligence:";

export function cacheKey(query: string) {
  return `${CACHE_PREFIX}${query.trim().toLocaleLowerCase()}`;
}

export function readCachedAnswer(query: string): IntelligenceAnswer | null {
  if (typeof window === "undefined" || !query.trim()) return null;
  try {
    const value = window.localStorage.getItem(cacheKey(query));
    return value ? (JSON.parse(value) as IntelligenceAnswer) : null;
  } catch {
    return null;
  }
}

export function writeCachedAnswer(query: string, answer: IntelligenceAnswer) {
  if (typeof window === "undefined" || !query.trim()) return;
  try {
    window.localStorage.setItem(cacheKey(query), JSON.stringify(answer));
  } catch {
    // Private browsing or storage quotas must never interrupt grounded Ask.
  }
}
