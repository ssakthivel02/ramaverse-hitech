import { eq } from "drizzle-orm";
import { sargas } from "../drizzle/schema";
import { NON_CANONICAL_KEY } from "./readerParity";
import { getDb } from "./db";

/** The current canonical Sarga Reader contract requires explicit source verification. */
export const READER_READY_REVIEW_STATUS = "source_verified" as const;

type ReaderReadinessCandidate = Pick<
  typeof sargas.$inferSelect,
  | "recordKey"
  | "kandaNumber"
  | "sargaIdentifier"
  | "editionId"
  | "sourceId"
  | "sourceLocator"
  | "traditionId"
  | "editorialDescriptor"
  | "summary"
>;

const hasText = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

/**
 * Checks minimum row structure only. The source registry and approved manifest
 * are NOT present: a synthetically marked source_verified row remains
 * insufficient to establish authentic canonical Reader parity.
 */
export function hasMinimumReaderProvenance(row: ReaderReadinessCandidate): boolean {
  const fields = [
    row.recordKey, row.sargaIdentifier, row.editionId, row.sourceId,
    row.sourceLocator, row.traditionId, row.editorialDescriptor, row.summary,
  ];
  if (!fields.every(hasText)) return false;
  if (!Number.isInteger(row.kandaNumber) || row.kandaNumber < 1 || row.kandaNumber > 7) return false;
  return ![row.recordKey, row.sargaIdentifier, row.sourceId].some(
    value => NON_CANONICAL_KEY.test(value),
  );
}

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
      kandaNumber: sargas.kandaNumber,
      sargaIdentifier: sargas.sargaIdentifier,
      editionId: sargas.editionId,
      sourceId: sargas.sourceId,
      sourceLocator: sargas.sourceLocator,
      traditionId: sargas.traditionId,
      editorialDescriptor: sargas.editorialDescriptor,
      summary: sargas.summary,
    }).from(sargas).where(eq(sargas.reviewStatus, READER_READY_REVIEW_STATUS)).limit(1);
    return rows.some(hasMinimumReaderProvenance);
  } catch {
    return false;
  }
}
