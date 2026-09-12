import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const source = fs.readFileSync(path.resolve(import.meta.dirname, "Home.tsx"), "utf8");

describe("Home hero CTA semantics", () => {
  it("renders the Kandas and Search CTAs as single interactive elements", () => {
    expect(source).toContain('<Button asChild className="h-12 rounded-full bg-[#d7b45a]');
    expect(source).toContain('<Button asChild variant="outline"');
    expect(source).not.toContain('<Link href={localizedPath(language, "/kandas")}>' + "\n" + '                  <Button');
    expect(source).not.toContain('<Link href={localizedPath(language, "/search")}>' + "\n" + '                  <Button');
  });
});
