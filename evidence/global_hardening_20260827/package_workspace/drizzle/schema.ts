import { mysqlTable, int, varchar, text, json, timestamp, mysqlEnum } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const kandas = mysqlTable("kandas", {
  id: int("id").autoincrement().primaryKey(),
  kandaNumber: int("kandaNumber").notNull().unique(),
  name: varchar("name", { length: 128 }).notNull(),
  sanskritName: varchar("sanskritName", { length: 128 }).notNull(),
  sargasCount: int("sargasCount").notNull(),
  summary: text("summary").notNull(),
  keyEvents: json("keyEvents").notNull(),
  reviewStatus: varchar("reviewStatus", { length: 64 }).notNull().default("needs_source_review"),
  imageUrl: text("imageUrl"),
});

export const sargas = mysqlTable("sargas", {
  id: int("id").autoincrement().primaryKey(),
  recordKey: varchar("recordKey", { length: 96 }).notNull().unique(),
  kandaNumber: int("kandaNumber").notNull(),
  editionId: varchar("editionId", { length: 96 }).notNull(),
  sargaIdentifier: varchar("sargaIdentifier", { length: 64 }).notNull(),
  editorialDescriptor: varchar("editorialDescriptor", { length: 255 }).notNull(),
  summary: text("summary").notNull(),
  sourceId: varchar("sourceId", { length: 64 }).notNull(),
  sourceLocator: varchar("sourceLocator", { length: 255 }).notNull(),
  traditionId: varchar("traditionId", { length: 96 }).notNull(),
  reviewStatus: varchar("reviewStatus", { length: 64 }).notNull().default("needs_source_review"),
  confidence: varchar("confidence", { length: 64 }).notNull().default("source_verified"),
});

export const wisdomRecords = mysqlTable("wisdom_records", {
  id: int("id").autoincrement().primaryKey(),
  recordNumber: int("recordNumber").notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  category: varchar("category", { length: 128 }).notNull(),
  shlokaSanskrit: text("shlokaSanskrit"),
  transliteration: text("transliteration"),
  translation: text("translation").notNull(),
  philosophicalInsight: text("philosophicalInsight").notNull(),
  kandaId: int("kandaId"),
  sourceReference: varchar("sourceReference", { length: 255 }),
  reviewStatus: varchar("reviewStatus", { length: 64 }).notNull().default("needs_source_review"),
});

export const characters = mysqlTable("characters", {
  id: int("id").autoincrement().primaryKey(),
  characterNumber: int("characterNumber").notNull().unique(),
  name: varchar("name", { length: 128 }).notNull(),
  title: varchar("title", { length: 255 }),
  roleCategory: varchar("roleCategory", { length: 64 }).notNull(),
  description: text("description").notNull(),
  relationships: json("relationships").notNull(),
  appearances: json("appearances").notNull(),
  reviewStatus: varchar("reviewStatus", { length: 64 }).notNull().default("needs_source_review"),
  imageUrl: text("imageUrl"),
});

export const places = mysqlTable("places", {
  id: int("id").autoincrement().primaryKey(),
  placeNumber: int("placeNumber").notNull().unique(),
  name: varchar("name", { length: 128 }).notNull(),
  modernLocation: varchar("modernLocation", { length: 128 }),
  significance: text("significance").notNull(),
  associatedKandas: json("associatedKandas").notNull(),
  coordinates: varchar("coordinates", { length: 64 }),
  reviewStatus: varchar("reviewStatus", { length: 64 }).notNull().default("needs_source_review"),
});

export const guidanceRecords = mysqlTable("guidance_records", {
  id: int("id").autoincrement().primaryKey(),
  recordNumber: int("recordNumber").notNull().unique(),
  theme: varchar("theme", { length: 128 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  advice: text("advice").notNull(),
  kandaReference: varchar("kandaReference", { length: 128 }),
  characterReference: varchar("characterReference", { length: 128 }),
  reviewStatus: varchar("reviewStatus", { length: 64 }).notNull().default("needs_source_review"),
});

export const kidsStories = mysqlTable("kids_stories", {
  id: int("id").autoincrement().primaryKey(),
  storyNumber: int("storyNumber").notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  moral: varchar("moral", { length: 255 }).notNull(),
  content: text("content").notNull(),
  ageGroup: varchar("ageGroup", { length: 32 }).default("All Ages"),
  reviewStatus: varchar("reviewStatus", { length: 64 }).notNull().default("needs_source_review"),
  imageUrl: text("imageUrl"),
});

export const quizzes = mysqlTable("quizzes", {
  id: int("id").autoincrement().primaryKey(),
  quizNumber: int("quizNumber").notNull().unique(),
  question: text("question").notNull(),
  options: json("options").notNull(),
  correctAnswerIndex: int("correctAnswerIndex").notNull(),
  explanation: text("explanation").notNull(),
  difficulty: varchar("difficulty", { length: 32 }).default("Medium"),
  kandaReference: varchar("kandaReference", { length: 128 }),
  reviewStatus: varchar("reviewStatus", { length: 64 }).notNull().default("needs_source_review"),
});

export const audioScripts = mysqlTable("audio_scripts", {
  id: int("id").autoincrement().primaryKey(),
  scriptNumber: int("scriptNumber").notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  durationMinutes: int("durationMinutes").notNull(),
  transcript: text("transcript").notNull(),
  scriptContent: text("scriptContent"),
  narratorRole: varchar("narratorRole", { length: 128 }),
  musicalMood: varchar("musicalMood", { length: 128 }),
  ageGroup: varchar("ageGroup", { length: 32 }).default("All Ages"),
  reviewStatus: varchar("reviewStatus", { length: 64 }).notNull().default("needs_source_review"),
});

export const dialogues = mysqlTable("dialogues", {
  id: int("id").autoincrement().primaryKey(),
  dialogueKey: varchar("dialogueKey", { length: 96 }).notNull().unique(),
  speaker: varchar("speaker", { length: 128 }).notNull(),
  listener: varchar("listener", { length: 128 }).notNull(),
  context: text("context").notNull(),
  quote: text("quote"),
  paraphrase: text("paraphrase").notNull(),
  simpleExplanation: text("simpleExplanation").notNull(),
  deeperExplanation: text("deeperExplanation").notNull(),
  dharmaPrinciple: varchar("dharmaPrinciple", { length: 128 }).notNull(),
  sourceLocator: varchar("sourceLocator", { length: 255 }).notNull(),
  traditionStatus: varchar("traditionStatus", { length: 64 }).notNull().default("VERIFIED_CANONICAL"),
  reviewStatus: varchar("reviewStatus", { length: 64 }).notNull().default("human_reviewed"),
});

export const dharmaLessons = mysqlTable("dharma_lessons", {
  id: int("id").autoincrement().primaryKey(),
  lessonKey: varchar("lessonKey", { length: 96 }).notNull().unique(),
  theme: varchar("theme", { length: 128 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  sourceTextExcerpt: text("sourceTextExcerpt").notNull(),
  traditionalInterpretation: text("traditionalInterpretation").notNull(),
  editorialLifeApplication: text("editorialLifeApplication").notNull(),
  sourceLocator: varchar("sourceLocator", { length: 255 }).notNull(),
  reviewStatus: varchar("reviewStatus", { length: 64 }).notNull().default("human_reviewed"),
});

export const devotionalPractices = mysqlTable("devotional_practices", {
  id: int("id").autoincrement().primaryKey(),
  practiceKey: varchar("practiceKey", { length: 96 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  traditionSource: varchar("traditionSource", { length: 255 }).notNull(),
  traditionalPurpose: text("traditionalPurpose").notNull(),
  disclaimer: text("disclaimer").notNull().default("Traditional practice and observance. No outcome or remedy is guaranteed."),
  traditionCategory: varchar("traditionCategory", { length: 64 }).notNull().default("TRADITIONAL"),
  reviewStatus: varchar("reviewStatus", { length: 64 }).notNull().default("human_reviewed"),
});

export const temples = mysqlTable("temples", {
  id: int("id").autoincrement().primaryKey(),
  templeKey: varchar("templeKey", { length: 96 }).notNull().unique(),
  name: varchar("name", { length: 128 }).notNull(),
  deity: varchar("deity", { length: 128 }).notNull(),
  location: varchar("location", { length: 128 }).notNull(),
  historicalSignificance: text("historicalSignificance").notNull(),
  pilgrimageAssociation: text("pilgrimageAssociation").notNull(),
  officialChannelsOnly: text("officialChannelsOnly").notNull(),
  reviewStatus: varchar("reviewStatus", { length: 64 }).notNull().default("human_reviewed"),
});

export const traditionMappings = mysqlTable("tradition_mappings", {
  id: int("id").autoincrement().primaryKey(),
  mappingKey: varchar("mappingKey", { length: 96 }).notNull().unique(),
  episodeTitle: varchar("title", { length: 255 }).notNull(),
  valmikiTreatment: text("valmikiTreatment").notNull(),
  kambaTreatment: text("kambaTreatment").notNull(),
  tulsiTreatment: text("tulsiTreatment").notNull(),
  adhyatmaTreatment: text("adhyatmaTreatment").notNull(),
  regionalVariant: text("regionalVariant").notNull(),
  reviewStatus: varchar("reviewStatus", { length: 64 }).notNull().default("human_reviewed"),
});
