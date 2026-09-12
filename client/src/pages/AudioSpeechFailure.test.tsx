import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Audio speech failure contract", () => {
  const source = readFileSync(resolve(process.cwd(), "client/src/pages/Audio.tsx"), "utf8");

  it("resets playback state and surfaces accessible feedback when speech synthesis fails", () => {
    expect(source).toContain("utterance.onerror = () => {");
    expect(source).toContain("resetSpeechState();");
    expect(source).toContain("Narration could not be played. Please try again or use another browser voice.");
    expect(source).toContain('role="alert"');
    expect(source).toContain("Speech synthesis is not supported in this browser.");
  });
});
