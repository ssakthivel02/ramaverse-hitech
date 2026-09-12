import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("Search status accessibility contract", () => {
  const source = fs.readFileSync(path.resolve(process.cwd(), "client/src/pages/Search.tsx"), "utf8");

  it("announces loading and empty-result states politely", () => {
    expect(source).toContain('role="status" aria-live="polite" aria-atomic="true" className="py-20 text-center text-[#d4af37]"');
    expect(source).toContain('role="status" aria-live="polite" aria-atomic="true" className="py-20 text-center text-sm text-[#f3e9d2]/60"');
  });

  it("announces a match count only when matches exist and loading has finished", () => {
    expect(source).toContain("activeQuery && !isLoading && filtered.length > 0");
    expect(source).toContain('role="status" aria-live="polite" aria-atomic="true" className="mt-2 text-center text-xs text-[#d4af37]"');
  });

  it("avoids a second live region around the populated result grid", () => {
    expect(source).toContain('ref={resultRef} className="mt-12 grid gap-4 md:grid-cols-2"');
    expect(source).not.toContain('ref={resultRef} className="mt-12 grid gap-4 md:grid-cols-2" aria-live="polite"');
  });
});
