import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(resolve(process.cwd(), "client/src/pages/Audio.tsx"), "utf8");

describe("Audio speech synthesis runtime failure contract", () => {
  it("resets active playback state when the utterance errors", () => {
    expect(source).toContain("utterance.onerror = () => {");
    expect(source).toContain("setIsPlaying(false);");
    expect(source).toContain("setActiveSpeechId(null);");
  });

  it("surfaces runtime playback failures accessibly", () => {
    expect(source).toContain("const [speechError, setSpeechError]");
    expect(source).toContain('role="alert"');
    expect(source).toContain("Narration could not be played. Please try again or use another browser voice.");
  });
});
