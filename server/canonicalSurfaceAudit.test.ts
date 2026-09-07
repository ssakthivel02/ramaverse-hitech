import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createTestContext(): TrpcContext {
  return { user: undefined, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: { clearCookie: () => {} } as TrpcContext["res"] };
}

const repoRoot = process.cwd();
const hasDatabase = Boolean(process.env.DATABASE_URL);

describe("canonical-only public discovery surfaces", () => {
  it("keeps reader, Rama Life, and Character discovery code free of staging identifiers", () => {
    const pages = ["SargaReader.tsx", "RamaLife.tsx", "Characters.tsx"].map((file) => fs.readFileSync(path.join(repoRoot, "client", "src", "pages", file), "utf8"));
    expect(pages.join("\n")).not.toContain("stg-v2-");
    expect(pages.join("\n")).not.toContain("ramaverse_canonical_staging_v2");
  });

  it.skipIf(!hasDatabase)("returns only published canonical records to the procedures used by public discovery", async () => {
    const caller = appRouter.createCaller(createTestContext());
    const [kandas, sargas, characters] = await Promise.all([caller.ramaverse.getKandas(), caller.ramaverse.getSargas(), caller.ramaverse.getCharacters()]);

    expect(JSON.stringify({ kandas, sargas, characters })).not.toContain("stg-v2-");
    expect(sargas).toEqual(expect.arrayContaining([expect.objectContaining({ recordKey: "VR-IITK-BALA-001", reviewStatus: "source_verified" })]));
    expect(characters.length).toBeGreaterThan(0);
  });
});
