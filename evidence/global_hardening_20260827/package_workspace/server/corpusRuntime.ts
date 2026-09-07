import path from "node:path";
import { activationRoot, validateActiveCorpus, type CorpusPointer, type CorpusManifest } from "./corpusActivation";

export type ActiveCorpus = { pointer: CorpusPointer; manifest: CorpusManifest };

export function getCorpusRoot(): string {
  return process.env.RAMAVERSE_CORPUS_ROOT || path.join(process.cwd(), "data", "corpus");
}

export async function resolveActiveCorpus(): Promise<ActiveCorpus> {
  return validateActiveCorpus(activationRoot(getCorpusRoot()));
}

export async function assertActiveCorpus(): Promise<ActiveCorpus> {
  try {
    return await resolveActiveCorpus();
  } catch (error) {
    throw new Error(`RamaVerse corpus parity check failed closed: ${(error as Error).message}`);
  }
}
