import { assertActiveCorpus } from "../server/corpusRuntime.ts";
const active = await assertActiveCorpus();
if (active.pointer.activeCorpusVersion !== "v1.4.0" || active.pointer.canonicalCount !== 550) throw new Error("unexpected active pointer");
console.log(`RUNTIME_ACTIVE_POINTER=PASS ${active.pointer.activeCorpusVersion} ${active.pointer.canonicalCount}`);
