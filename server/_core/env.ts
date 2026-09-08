export const ENV = {
  appId: process.env.VITE_APP_ID ?? "ramaverse",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",

  // Optional provider-neutral OpenID Connect authentication. Public Reader
  // access does not require identity, but account features use this boundary.
  oidcAuthorizationUrl: process.env.OIDC_AUTHORIZATION_URL ?? "",
  oidcTokenUrl: process.env.OIDC_TOKEN_URL ?? "",
  oidcUserInfoUrl: process.env.OIDC_USERINFO_URL ?? "",
  oidcClientId: process.env.OIDC_CLIENT_ID ?? process.env.VITE_APP_ID ?? "ramaverse",
  oidcClientSecret: process.env.OIDC_CLIENT_SECRET ?? "",
  oidcScopes: process.env.OIDC_SCOPES ?? "openid profile email",
  oidcProviderName: process.env.OIDC_PROVIDER_NAME ?? "oidc",

  // Provider-neutral OpenAI-compatible AI endpoint. The canonical Reader and
  // corpus runtime do not depend on this unless an intelligence feature calls it.
  llmApiUrl: process.env.LLM_API_URL ?? process.env.OPENAI_BASE_URL ?? "",
  llmApiKey: process.env.LLM_API_KEY ?? process.env.OPENAI_API_KEY ?? "",
  llmModel: process.env.LLM_MODEL ?? "",
};
