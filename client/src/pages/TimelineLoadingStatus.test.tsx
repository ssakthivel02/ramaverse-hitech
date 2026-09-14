import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Timeline loading status", () => {
  it("announces the Timeline loading state as a polite atomic live region", () => {
    const source = readFileSync("client/src/pages/Timeline.tsx", "utf8");

    expect(source).toContain(
      'isLoading ? <div role="status" aria-live="polite" aria-atomic="true" className="py-20 text-center text-[#d7b45a]">{t("searching")}</div>'
    );
  });
});
