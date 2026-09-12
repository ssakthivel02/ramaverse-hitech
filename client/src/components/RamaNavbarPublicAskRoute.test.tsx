import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(resolve(process.cwd(), "client/src/components/RamaNavbar.tsx"), "utf8");

describe("RamaNavbar public Ask route contract", () => {
  it("keeps Ask as the discoverable intelligence route without duplicating the internal alias", () => {
    expect(source).toContain('{ href: "/ask", label: t("navAsk"), icon: MessageSquare }');
    expect(source).not.toContain('{ href: "/intelligence", label: t("navAsk"), icon: Sparkles }');
  });
});
