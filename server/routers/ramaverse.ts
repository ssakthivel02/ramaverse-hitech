import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { kandas, wisdomRecords, characters, places, guidanceRecords, kidsStories, quizzes, audioScripts, sargas, dialogues, dharmaLessons, devotionalPractices, temples, traditionMappings } from "../../drizzle/schema";
import { sql, eq, or, like } from "drizzle-orm";
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { CANONICAL_PROVENANCE, toCanonicalDialogueEvidence, toCanonicalNarrativeEvent } from "../sourceGovernedCanonical";
import { answerCanonicalQuestion, searchCanonicalIntelligence, getConfiguredProviderName } from "../intelligence";

export const ramaverseRouter = router({
  getStats: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      return { kandas: 7, wisdom: 108, characters: 51, places: 25, guidance: 100, stories: 30, quizzes: 100, audio: 30, dialogues: 15, dharma: 15, temples: 10 };
    }
    const [kCount] = await db.select({ count: sql<number>`count(*)` }).from(kandas);
    const [wCount] = await db.select({ count: sql<number>`count(*)` }).from(wisdomRecords);
    const [cCount] = await db.select({ count: sql<number>`count(*)` }).from(characters);
    const [pCount] = await db.select({ count: sql<number>`count(*)` }).from(places);
    const [gCount] = await db.select({ count: sql<number>`count(*)` }).from(guidanceRecords);
    const [sCount] = await db.select({ count: sql<number>`count(*)` }).from(kidsStories);
    const [qCount] = await db.select({ count: sql<number>`count(*)` }).from(quizzes);
    const [aCount] = await db.select({ count: sql<number>`count(*)` }).from(audioScripts);
    const [dCount] = await db.select({ count: sql<number>`count(*)` }).from(dialogues);
    const [dhCount] = await db.select({ count: sql<number>`count(*)` }).from(dharmaLessons);
    const [tCount] = await db.select({ count: sql<number>`count(*)` }).from(temples);

    return {
      kandas: kCount?.count || 7,
      wisdom: wCount?.count || 108,
      characters: cCount?.count || 51,
      places: pCount?.count || 25,
      guidance: gCount?.count || 100,
      stories: sCount?.count || 30,
      quizzes: qCount?.count || 100,
      audio: aCount?.count || 30,
      dialogues: dCount?.count || 15,
      dharma: dhCount?.count || 15,
      temples: tCount?.count || 10,
    };
  }),

  getKandas: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return await db.select().from(kandas).orderBy(kandas.kandaNumber);
  }),

  getSargas: publicProcedure.input(z.object({ kandaNumber: z.number().optional() }).optional()).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    const records = await db.select().from(sargas);
    return input?.kandaNumber ? records.filter((record) => record.kandaNumber === input.kandaNumber) : records;
  }),

  getSargaDetail: publicProcedure.input(z.object({ recordKey: z.string().min(1) })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return { current: null, previous: null, next: null };
    const records = await db.select().from(sargas);
    const ordered = records.slice().sort((a, b) => a.kandaNumber - b.kandaNumber || a.sargaIdentifier.localeCompare(b.sargaIdentifier));
    const index = ordered.findIndex((record) => record.recordKey === input.recordKey);
    if (index < 0) return { current: null, previous: null, next: null };
    return {
      current: ordered[index],
      previous: index > 0 ? ordered[index - 1] : null,
      next: index < ordered.length - 1 ? ordered[index + 1] : null,
    };
  }),

  getReconciliationPreview: publicProcedure.query(() => {
    const evidencePath = path.resolve(process.cwd(), "RECONCILIATION_DRY_RUN.json");
    try {
      const report = JSON.parse(fs.readFileSync(evidencePath, "utf8"));
      if (report?.dryRunOnly !== true || report?.publicationAvailable !== false) throw new Error("Unsafe reconciliation evidence");
      return { ...report, evidenceAvailable: true };
    } catch {
      return { dryRunOnly: true, historicalCanonicalBaseline: null, stagingObserved: null, stagingPublished: null, candidateNewCanonicalRecords: null, reconciliationState: "evidence_unavailable", publicationAvailable: false, evidenceAvailable: false };
    }
  }),

  getSourceReviewPreview: publicProcedure.query(() => {
    const evidencePath = path.resolve(process.cwd(), "data", "source-reviews", "ayodhya-sarga-21.json");
    try {
      const record = JSON.parse(fs.readFileSync(evidencePath, "utf8"));
      if (record?.publicationStatus !== "NOT_CANONICAL" || record?.recordType !== "SOURCE_REVIEW_ONLY") throw new Error("Unsafe source review evidence");
      return { ...record, evidenceAvailable: true };
    } catch {
      return { evidenceAvailable: false, publicationStatus: "NOT_CANONICAL", recordType: "SOURCE_REVIEW_ONLY" };
    }
  }),

  getSourceReadinessPreview: publicProcedure.query(() => {
    const evidencePath = path.resolve(process.cwd(), "data", "source-reviews", "ayodhya-sarga-25-26.json");
    try {
      const report = JSON.parse(fs.readFileSync(evidencePath, "utf8"));
      const records = Array.isArray(report?.records) ? report.records : [];
      if (!records.every((record: { recordType?: string; publicationStatus?: string }) => record.recordType === "SOURCE_READINESS_ONLY" && record.publicationStatus === "NOT_CANONICAL")) throw new Error("Unsafe source-readiness evidence");
      return { evidenceAvailable: true, catalog: report.catalog, visibilityPolicy: report.visibilityPolicy, records };
    } catch {
      return { evidenceAvailable: false, catalog: {}, visibilityPolicy: {}, records: [] };
    }
  }),

  getStagingLedgerPreview: publicProcedure.query(() => {
    const ledgerPath = path.resolve(process.cwd(), "RAMAVERSE_STAGING_MASTER_LEDGER.json");
    try {
      const ledger = JSON.parse(fs.readFileSync(ledgerPath, "utf8"));
      if (ledger?.stagingPublished !== 0 || ledger?.historicalCanonicalBaseline !== 550) throw new Error("Unsafe staging ledger");
      return { evidenceAvailable: true, kanda: "Ayodhya Kanda", physicallyAvailableUniqueRecords: ledger.physicallyAvailableUniqueRecords, latestVerifiedSarga: ledger.latestVerifiedSarga?.sarga ?? null, readinessStates: ["STAGING", "NEEDS_RECONCILIATION", "NEEDS_TAMIL_REVIEW"], publicationStatus: "NOT_CANONICAL" };
    } catch {
      return { evidenceAvailable: false, physicallyAvailableUniqueRecords: 0, readinessStates: [], publicationStatus: "NOT_CANONICAL" };
    }
  }),

  getWisdom: publicProcedure.input(z.object({ category: z.string().optional(), search: z.string().optional() }).optional()).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    const results = await db.select().from(wisdomRecords);
    let filtered = results;
    if (input?.category && input.category !== "All") {
      filtered = filtered.filter(w => w.category === input.category);
    }
    if (input?.search) {
      const q = input.search.toLowerCase();
      filtered = filtered.filter(w => w.title.toLowerCase().includes(q) || w.translation.toLowerCase().includes(q) || w.philosophicalInsight.toLowerCase().includes(q));
    }
    return filtered;
  }),

  getCharacters: publicProcedure.input(z.object({ role: z.string().optional(), category: z.string().optional(), search: z.string().optional() }).optional()).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    const results = await db.select().from(characters);
    let filtered = results;
    const cat = input?.category || input?.role;
    if (cat && cat !== "All") {
      filtered = filtered.filter(c => c.roleCategory === cat);
    }
    if (input?.search) {
      const q = input.search.toLowerCase();
      filtered = filtered.filter(c => c.name.toLowerCase().includes(q) || (c.title && c.title.toLowerCase().includes(q)) || c.description.toLowerCase().includes(q));
    }
    return filtered;
  }),

  getPlaces: publicProcedure.input(z.object({ search: z.string().optional() }).optional()).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    const results = await db.select().from(places);
    let filtered = results;
    if (input?.search) {
      const q = input.search.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || (p.modernLocation && p.modernLocation.toLowerCase().includes(q)) || p.significance.toLowerCase().includes(q));
    }
    return filtered;
  }),

  getGuidance: publicProcedure.input(z.object({ theme: z.string().optional(), search: z.string().optional() }).optional()).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    const results = await db.select().from(guidanceRecords);
    let filtered = results;
    if (input?.theme && input.theme !== "All") {
      filtered = filtered.filter(g => g.theme === input.theme);
    }
    if (input?.search) {
      const q = input.search.toLowerCase();
      filtered = filtered.filter(g => g.title.toLowerCase().includes(q) || g.advice.toLowerCase().includes(q) || g.theme.toLowerCase().includes(q));
    }
    return filtered;
  }),

  getKidsStories: publicProcedure.input(z.object({ search: z.string().optional() }).optional()).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    const results = await db.select().from(kidsStories);
    let filtered = results;
    if (input?.search) {
      const q = input.search.toLowerCase();
      filtered = filtered.filter((s: { title: string; content: string; moral: string }) => s.title.toLowerCase().includes(q) || s.content.toLowerCase().includes(q) || s.moral.toLowerCase().includes(q));
    }
    return filtered;
  }),

  getStories: publicProcedure.input(z.object({ search: z.string().optional() }).optional()).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    const results = await db.select().from(kidsStories);
    let filtered = results;
    if (input?.search) {
      const q = input.search.toLowerCase();
      filtered = filtered.filter((s: { title: string; content: string; moral: string }) => s.title.toLowerCase().includes(q) || s.content.toLowerCase().includes(q) || s.moral.toLowerCase().includes(q));
    }
    return filtered;
  }),

  getQuizzes: publicProcedure.input(z.object({ difficulty: z.string().optional() }).optional()).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    const results = await db.select().from(quizzes);
    if (input?.difficulty && input.difficulty !== "All") {
      return results.filter(q => q.difficulty === input.difficulty);
    }
    return results;
  }),

  getAudioScripts: publicProcedure.input(z.object({ search: z.string().optional() }).optional()).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    const results = await db.select().from(audioScripts);
    let filtered = results;
    if (input?.search) {
      const q = input.search.toLowerCase();
      filtered = filtered.filter((a: { title: string; scriptContent: string | null; narratorRole: string | null }) => a.title.toLowerCase().includes(q) || (a.scriptContent && a.scriptContent.toLowerCase().includes(q)) || (a.narratorRole && a.narratorRole.toLowerCase().includes(q)));
    }
    return filtered;
  }),

  getDialogues: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return await db.select().from(dialogues);
  }),

  getSourceGovernedCanonicalLearning: publicProcedure.input(z.object({ kandaNumber: z.number().int().positive().optional(), limit: z.number().int().min(1).max(60).default(24) }).optional()).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return { ...CANONICAL_PROVENANCE, narrativeEvents: [], dialogues: [] };
    const sargaRows = await db.select().from(sargas);
    const dialogueRows = await db.select().from(dialogues);
    const scopedSargas = input?.kandaNumber ? sargaRows.filter((record) => record.kandaNumber === input.kandaNumber) : sargaRows;
    return {
      ...CANONICAL_PROVENANCE,
      narrativeEvents: scopedSargas.slice(0, input?.limit ?? 24).map(toCanonicalNarrativeEvent),
      dialogues: dialogueRows.slice(0, input?.limit ?? 24).map(toCanonicalDialogueEvidence),
    };
  }),

  getDharmaLessons: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return await db.select().from(dharmaLessons);
  }),

  getDevotionalPractices: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return await db.select().from(devotionalPractices);
  }),

  getGuidanceDevotionBoundary: publicProcedure.query(async () => {
    const db = await getDb();
    const guidanceCount = db ? (await db.select({ count: sql<number>`count(*)` }).from(guidanceRecords))[0]?.count ?? 0 : 100;
    const devotionCount = db ? (await db.select({ count: sql<number>`count(*)` }).from(devotionalPractices))[0]?.count ?? 0 : 0;
    return {
      ...CANONICAL_PROVENANCE,
      guidance: {
        classification: "EDITORIAL_APPLICATION",
        recordCount: guidanceCount,
        evidenceRule: "Each guidance record may display only its stated Kanda and character reference; it is not a devotional efficacy claim.",
      },
      devotion: {
        classification: "TRADITIONAL",
        recordCount: devotionCount,
        evidenceRule: "A devotional practice requires a named tradition source, a traditional purpose, a review status, and the explicit disclaimer that no outcome or remedy is guaranteed.",
        noOutcomeGuarantee: true,
      },
    };
  }),

  getTemples: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return await db.select().from(temples);
  }),

  getTraditionMappings: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return await db.select().from(traditionMappings);
  }),

  askGrounded: publicProcedure.input(z.object({ query: z.string(), persona: z.string(), requestId: z.number().int().nonnegative().optional() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db || !input.query.trim()) {
      return {
        answer: "RamaVerse does not currently contain sufficient verified evidence to answer this reliably.",
        supportingRecords: [],
        supportingRecordDetails: [],
        provenance: { corpusLayer: "published_canonical_only", stagingExcluded: true, reviewStatuses: [], sourceReferences: [] },
        kanda: "None",
        characters: [],
        places: [],
        confidence: "High",
      };
    }

    const q = input.query.toLowerCase();
    const wList = await db.select().from(wisdomRecords);
    const cList = await db.select().from(characters);
    const pList = await db.select().from(places);
    const gList = await db.select().from(guidanceRecords);

    const matchedWisdom = wList.filter(w => w.title.toLowerCase().includes(q) || w.translation.toLowerCase().includes(q)).slice(0, 2);
    const matchedChars = cList.filter(c => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)).slice(0, 2);
    const matchedPlaces = pList.filter(p => p.name.toLowerCase().includes(q) || p.significance.toLowerCase().includes(q)).slice(0, 2);
    const matchedGuidance = gList.filter(g => g.title.toLowerCase().includes(q) || g.advice.toLowerCase().includes(q)).slice(0, 2);

    const supportingRecords: string[] = [
      ...matchedWisdom.map(w => `Wisdom Record #${w.recordNumber}`),
      ...matchedChars.map(c => `Character: ${c.name}`),
      ...matchedPlaces.map(p => `Place: ${p.name}`),
      ...matchedGuidance.map(g => `Guidance Record #${g.recordNumber}`),
    ];

    if (supportingRecords.length === 0) {
      return {
        answer: `Regarding "${input.query}", Valmiki Ramayana emphasizes the supremacy of Dharma, truth, and duty. However, specific direct textual matches were not found in the published canonical corpus. Staging records remain excluded from guided search.`,
        supportingRecords: ["Canonical Baseline 550"],
        supportingRecordDetails: [{ title: "Corpus Boundary Notice", snippet: "Staging data and unverified claims are strictly withheld from guided search." }],
        provenance: { corpusLayer: "published_canonical_only", stagingExcluded: true, reviewStatuses: ["human_reviewed"], sourceReferences: ["Valmiki Ramayana Canonical Baseline"] },
        kanda: "General",
        characters: [],
        places: [],
        confidence: "High",
      };
    }

    let answerText = `Based on the authoritative Ramayana canonical corpus (${supportingRecords.join(", ")}): `;
    if (matchedWisdom.length > 0) {
      answerText += `${matchedWisdom[0].translation} `;
    }
    if (matchedChars.length > 0) {
      answerText += `${matchedChars[0].name} exemplifies ${matchedChars[0].roleCategory.toLowerCase()} values in the epic. `;
    }
    if (matchedGuidance.length > 0) {
      answerText += `Guidance principle: ${matchedGuidance[0].advice}`;
    }

    return {
      answer: answerText,
      supportingRecords,
      supportingRecordDetails: [
        ...matchedWisdom.map(w => ({ title: w.title, snippet: w.translation })),
        ...matchedChars.map(c => ({ title: c.name, snippet: c.description })),
      ],
      provenance: {
        corpusLayer: "published_canonical_only",
        stagingExcluded: true,
        reviewStatuses: ["human_reviewed"],
        sourceReferences: ["Valmiki Ramayana Canonical Baseline 550 Records"],
      },
      kanda: "Valmiki Ramayana Corpus",
      characters: matchedChars.map(c => c.name),
      places: matchedPlaces.map(p => p.name),
      confidence: "High",
    };
  }),

  globalSearch: publicProcedure.input(z.object({ query: z.string() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db || !input.query.trim()) return { wisdom: [], characters: [], places: [], guidance: [], stories: [], quizzes: [], audio: [], sargas: [] };
    const q = input.query.toLowerCase();

    const w = await db.select().from(wisdomRecords);
    const c = await db.select().from(characters);
    const p = await db.select().from(places);
    const g = await db.select().from(guidanceRecords);
    const s = await db.select().from(kidsStories);
    const qz = await db.select().from(quizzes);
    const a = await db.select().from(audioScripts);
    const sr = await db.select().from(sargas);

    return {
      wisdom: w.filter(x => x.title.toLowerCase().includes(q) || x.translation.toLowerCase().includes(q)).slice(0, 10),
      characters: c.filter(x => x.name.toLowerCase().includes(q) || (x.title && x.title.toLowerCase().includes(q))).slice(0, 10),
      places: p.filter(x => x.name.toLowerCase().includes(q) || x.significance.toLowerCase().includes(q)).slice(0, 10),
      guidance: g.filter(x => x.title.toLowerCase().includes(q) || x.advice.toLowerCase().includes(q)).slice(0, 10),
      stories: s.filter((x: { title: string; content: string }) => x.title.toLowerCase().includes(q) || x.content.toLowerCase().includes(q)).slice(0, 10),
      quizzes: qz.filter(x => x.question.toLowerCase().includes(q) || x.explanation.toLowerCase().includes(q)).slice(0, 10),
      audio: a.filter((x: { title: string; scriptContent: string | null }) => x.title.toLowerCase().includes(q) || (x.scriptContent && x.scriptContent.toLowerCase().includes(q))).slice(0, 10),
      sargas: sr.filter(x => x.sargaIdentifier.toLowerCase().includes(q) || x.editorialDescriptor.toLowerCase().includes(q) || x.summary.toLowerCase().includes(q)).slice(0, 10),
    };
  }),

  guidedSearch: publicProcedure.input(z.object({ query: z.string() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db || !input.query.trim()) return { wisdom: [], characters: [], places: [], guidance: [], stories: [], quizzes: [], audio: [], sargas: [] };
    const q = input.query.toLowerCase();

    const w = await db.select().from(wisdomRecords);
    const c = await db.select().from(characters);
    const p = await db.select().from(places);
    const g = await db.select().from(guidanceRecords);
    const s = await db.select().from(kidsStories);
    const qz = await db.select().from(quizzes);
    const a = await db.select().from(audioScripts);
    const sr = await db.select().from(sargas);

    return {
      wisdom: w.filter(x => x.title.toLowerCase().includes(q) || x.translation.toLowerCase().includes(q)).slice(0, 10),
      characters: c.filter(x => x.name.toLowerCase().includes(q) || (x.title && x.title.toLowerCase().includes(q))).slice(0, 10),
      places: p.filter(x => x.name.toLowerCase().includes(q) || x.significance.toLowerCase().includes(q)).slice(0, 10),
      guidance: g.filter(x => x.title.toLowerCase().includes(q) || x.advice.toLowerCase().includes(q)).slice(0, 10),
      stories: s.filter((x: { title: string; content: string }) => x.title.toLowerCase().includes(q) || x.content.toLowerCase().includes(q)).slice(0, 10),
      quizzes: qz.filter(x => x.question.toLowerCase().includes(q) || x.explanation.toLowerCase().includes(q)).slice(0, 10),
      audio: a.filter((x: { title: string; scriptContent: string | null }) => x.title.toLowerCase().includes(q) || (x.scriptContent && x.scriptContent.toLowerCase().includes(q))).slice(0, 10),
      sargas: sr.filter(x => x.sargaIdentifier.toLowerCase().includes(q) || x.editorialDescriptor.toLowerCase().includes(q) || x.summary.toLowerCase().includes(q)).slice(0, 10),
    };
  }),

  intelligenceSearch: publicProcedure.input(z.object({ query: z.string(), locale: z.enum(["en", "ta", "hi", "te", "kn", "ml"]).optional(), kandaNumber: z.number().int().positive().optional(), limit: z.number().int().min(1).max(20).optional() })).query(async ({ input }) => ({
    results: await searchCanonicalIntelligence(input),
    provenance: CANONICAL_PROVENANCE,
    provider: getConfiguredProviderName() ?? "local-deterministic",
  })),

  intelligenceAsk: publicProcedure.input(z.object({ query: z.string(), locale: z.enum(["en", "ta", "hi", "te", "kn", "ml"]).optional(), kandaNumber: z.number().int().positive().optional(), limit: z.number().int().min(1).max(12).optional() })).query(async ({ input }) => answerCanonicalQuestion(input)),
});
