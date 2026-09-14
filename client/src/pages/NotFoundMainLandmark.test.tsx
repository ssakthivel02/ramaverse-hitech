import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("NotFound main landmark", () => {
  it("exposes the standalone 404 content through a main landmark", () => {
    const source = readFileSync("client/src/pages/NotFound.tsx", "utf8");

    expect(source).toContain('<main className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">');
    expect(source).toContain("</main>");
  });
});
