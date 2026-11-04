import { describe, expect, it } from "vitest";
import {
  dialogues, dharmaLessons, devotionalPractices, temples, traditionMappings,
} from "../drizzle/schema";

describe("future content-table review defaults must fail closed", () => {
  const contentTables = [
    ["dialogues", dialogues],
    ["dharma_lessons", dharmaLessons],
    ["devotional_practices", devotionalPractices],
    ["temples", temples],
    ["tradition_mappings", traditionMappings],
  ] as const;

  for (const [name, table] of contentTables) {
    it(`${name} defaults to needs_source_review, not automatically human_reviewed`, () => {
      expect(table.reviewStatus.default).toBe("needs_source_review");
      expect(table.reviewStatus.hasDefault).toBe(true);
    });
  }

  it("requires explicit tradition status for dialogue records", () => {
    expect(dialogues.traditionStatus.hasDefault).toBe(false);
    expect(dialogues.traditionStatus.default).toBeUndefined();
  });
});
