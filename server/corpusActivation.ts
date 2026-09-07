import { createHash, randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

export type CorpusPointer = {
  schemaVersion: 1;
  activeCorpusVersion: string;
  canonicalCount: number;
  manifestHash: string;
  activatedAt: string;
  previousCorpusVersion: string | null;
  activationId: string;
};

export type CorpusManifest = {
  schemaVersion: 1;
  corpusVersion: string;
  canonicalCount: number;
  files: Record<string, { path: string; sha256: string; count?: number }>;
};

export type ActivationRoot = {
  root: string;
  versionsDir: string;
  activePointerPath: string;
  backupsDir: string;
};

const sha256 = (value: Buffer | string) => createHash("sha256").update(value).digest("hex");

export function activationRoot(root: string): ActivationRoot {
  return {
    root,
    versionsDir: path.join(root, "versions"),
    activePointerPath: path.join(root, "ACTIVE_CORPUS.json"),
    backupsDir: path.join(root, "backups"),
  };
}

async function readJson<T>(filePath: string): Promise<T> {
  return JSON.parse(await fs.readFile(filePath, "utf8")) as T;
}

async function writeAtomic(filePath: string, value: unknown): Promise<void> {
  const temp = `${filePath}.${process.pid}.${randomUUID()}.tmp`;
  await fs.writeFile(temp, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  await fs.rename(temp, filePath);
}

export async function readActivePointer(root: ActivationRoot): Promise<CorpusPointer> {
  return readJson<CorpusPointer>(root.activePointerPath);
}

export async function validateCorpusVersion(root: ActivationRoot, version: string): Promise<CorpusManifest> {
  const versionDir = path.join(root.versionsDir, version);
  const manifest = await readJson<CorpusManifest>(path.join(versionDir, "manifest.json"));
  if (manifest.schemaVersion !== 1 || manifest.corpusVersion !== version) throw new Error(`Invalid manifest identity for ${version}`);
  for (const [key, entry] of Object.entries(manifest.files)) {
    const filePath = path.join(versionDir, entry.path);
    const bytes = await fs.readFile(filePath);
    if (sha256(bytes) !== entry.sha256) throw new Error(`Hash mismatch for ${version}:${key}`);
  }
  return manifest;
}

export async function validateActiveCorpus(root: ActivationRoot): Promise<{ pointer: CorpusPointer; manifest: CorpusManifest }> {
  const pointer = await readActivePointer(root);
  const manifest = await validateCorpusVersion(root, pointer.activeCorpusVersion);
  const manifestHash = sha256(JSON.stringify(manifest));
  if (manifestHash !== pointer.manifestHash) throw new Error("Active pointer manifest hash mismatch");
  if (manifest.canonicalCount !== pointer.canonicalCount) throw new Error("Active pointer count mismatch");
  return { pointer, manifest };
}

export async function backupActiveCorpus(root: ActivationRoot): Promise<string> {
  const current = await validateActiveCorpus(root);
  await fs.mkdir(root.backupsDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backup = path.join(root.backupsDir, `RAMAVERSE_PRODUCTION_BACKUP_${stamp}.json`);
  await fs.writeFile(backup, `${JSON.stringify({ createdAt: new Date().toISOString(), pointer: current.pointer, manifest: current.manifest }, null, 2)}\n`, "utf8");
  return backup;
}

export async function activateCorpus(root: ActivationRoot, version: string): Promise<CorpusPointer> {
  const candidate = await validateCorpusVersion(root, version);
  const current = await validateActiveCorpus(root);
  const backupPath = await backupActiveCorpus(root);
  const next: CorpusPointer = {
    schemaVersion: 1,
    activeCorpusVersion: version,
    canonicalCount: candidate.canonicalCount,
    manifestHash: sha256(JSON.stringify(candidate)),
    activatedAt: new Date().toISOString(),
    previousCorpusVersion: current.pointer.activeCorpusVersion,
    activationId: randomUUID(),
  };
  try {
    await writeAtomic(root.activePointerPath, next);
    await validateActiveCorpus(root);
    return next;
  } catch (error) {
    await writeAtomic(root.activePointerPath, current.pointer);
    throw new Error(`Activation failed and baseline restored from ${backupPath}: ${(error as Error).message}`);
  }
}

export async function rollbackCorpus(root: ActivationRoot): Promise<CorpusPointer> {
  const current = await validateActiveCorpus(root);
  if (!current.pointer.previousCorpusVersion) throw new Error("No previous corpus version is recorded");
  const previous = await validateCorpusVersion(root, current.pointer.previousCorpusVersion);
  const next: CorpusPointer = {
    schemaVersion: 1,
    activeCorpusVersion: current.pointer.previousCorpusVersion,
    canonicalCount: previous.canonicalCount,
    manifestHash: sha256(JSON.stringify(previous)),
    activatedAt: new Date().toISOString(),
    previousCorpusVersion: null,
    activationId: randomUUID(),
  };
  await writeAtomic(root.activePointerPath, next);
  await validateActiveCorpus(root);
  return next;
}
