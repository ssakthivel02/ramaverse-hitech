import { sargas } from "../drizzle/schema";
import { hasMinimumReaderProvenance, READER_READY_REVIEW_STATUS } from "./readerReadiness";

/**
 * A minimum public-read exposure fence for database-backed Sarga routes.
 *
 * Does NOT establish corpus authority: only an approved Reader manifest,
 * source registry and full live parity can do that. Pending/staging/unlocated
 * records must never become visible just because the database contains them.
 */
export function isPublicReaderSarga(row: typeof sargas.$inferSelect): boolean {
  return row.reviewStatus === READER_READY_REVIEW_STATUS && hasMinimumReaderProvenance(row);
}
