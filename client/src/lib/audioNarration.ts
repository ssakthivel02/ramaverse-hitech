/** Select usable device-narration text without inventing a missing transcript. */
export function selectAudioNarrationText(record: {
  scriptContent?: string | null;
  transcript?: string | null;
}): string {
  return record.scriptContent?.trim() || record.transcript?.trim() || "";
}
