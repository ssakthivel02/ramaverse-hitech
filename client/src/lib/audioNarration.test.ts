import { describe, expect, it } from "vitest";
import { selectAudioNarrationText } from "./audioNarration";

describe("audio narration display fallback", () => {
  it("retains legacy scriptContent when a staged transcript is null", () => {
    expect(selectAudioNarrationText({ scriptContent: " Legacy source text ", transcript: null }))
      .toBe("Legacy source text");
  });
  it("falls back to a supplied transcript when legacy content is blank", () => {
    expect(selectAudioNarrationText({ scriptContent: "  ", transcript: " Recorded text " }))
      .toBe("Recorded text");
  });
  it("does not invent audio text when both fields are unavailable", () => {
    expect(selectAudioNarrationText({ scriptContent: null, transcript: null })).toBe("");
    expect(selectAudioNarrationText({})).toBe("");
  });
});
