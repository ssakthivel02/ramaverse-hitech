const allowLegacyForgeRuntime = process.env.ALLOW_LEGACY_FORGE_RUNTIME === "true";

export const ENV = {
  appId: process.env.VITE_APP_ID ?? "ramaverse",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",

  // Provider-neutral OpenAI-compatible AI endpoint. The canonical Reader and
  // corpus runtime do not depend on this unless an intelligence feature calls it.
  llmApiUrl: process.env.LLM_API_URL ?? process.env.OPENAI_BASE_URL ?? "",
  llmApiKey: process.env.LLM_API_KEY ?? process.env.OPENAI_API_KEY ?? "",
  llmModel: process.env.LLM_MODEL ?? "",

  // Transitional compatibility only. These fields keep imported helper modules
  // compiling while they are replaced. They stay empty unless the owner opts in.
  allowLegacyForgeRuntime,
  forgeApiUrl: allowLegacyForgeRuntime ? (process.env.BUILT_IN_FORGE_API_URL ?? "") : "",
  forgeApiKey: allowLegacyForgeRuntime ? (process.env.BUILT_IN_FORGE_API_KEY ?? "") : "",
};
