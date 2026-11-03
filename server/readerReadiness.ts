import { eq } from "drizzle-orm";
import { sargas } from "../drizzle/schema";
import { getDb } from "./db";

/** The current canonical Sarga Reader contract requires explicit source verification. */
export const READER_READY_REVIEW_STATUS = "source_verified" as const;

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
    }).from(sargas).where(eq(sargas.reviewStatus, READER_READY_REVIEW_STATUS)).limit(1);
    return rows.some(row =>
      Boolean(row.recordKey?.trim() && row.sourceId?.trim() && row.sourceLocator?.trim())
    );
  } catch {
    return false;
  }
}
