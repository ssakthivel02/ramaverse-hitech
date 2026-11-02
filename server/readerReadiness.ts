import { eq } from "drizzle-orm";
import { sargas } from "../drizzle/schema";
import { getDb } from "./db";

/**
 * A bounded, read-only Reader probe. This is a minimum readiness signal,
 * NOT proof of full canonical corpus/database parity or deployment acceptance.
 */
export async function probeReaderReadiness(): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;
    const rows = await db.select({
      recordKey: sargas.recordKey,
      sourceId: sargas.sourceId,
      sourceLocator: sargas.sourceLocator,
    }).from(sargas).where(eq(sargas.reviewStatus, "human_reviewed")).limit(1);
    return rows.some(row =>
      Boolean(row.recordKey?.trim() && row.sourceId?.trim() && row.sourceLocator?.trim())
    );
  } catch {
    return false;
  }
}
