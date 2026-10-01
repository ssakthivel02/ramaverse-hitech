export const SITE_ORIGIN = "https://ramaverse.omsaravanabhava.org";

export const INDEXABLE_PUBLIC_ROUTES = [
  "/",
  "/kandas",
  "/wisdom",
  "/characters",
  "/places",
  "/guidance",
  "/stories",
  "/quizzes",
  "/audio",
  "/search",
  "/ask",
  "/intelligence",
  "/library",
  "/journey",
  "/timeline",
  "/knowledge",
  "/rama-life",
  "/walk-with-rama",
] as const;

export const INDEXABLE_LOCALES = ["en", "ta", "hi", "te", "kn", "ml"] as const;

export function isIndexablePublicRoute(path: string): path is (typeof INDEXABLE_PUBLIC_ROUTES)[number] {
  return INDEXABLE_PUBLIC_ROUTES.includes(path as (typeof INDEXABLE_PUBLIC_ROUTES)[number]);
}

export function isIndexableLocale(locale?: string | null): locale is (typeof INDEXABLE_LOCALES)[number] | undefined | null {
  return !locale || INDEXABLE_LOCALES.includes(locale as (typeof INDEXABLE_LOCALES)[number]);
}

export function isIndexablePublicLocation(path: string, locale?: string | null) {
  return isIndexablePublicRoute(path) && isIndexableLocale(locale);
}

export function absolutePublicUrl(path: string, locale?: string | null) {
  const suffix = path === "/" ? "/" : path;
  return locale ? `${SITE_ORIGIN}/${locale}${suffix}` : `${SITE_ORIGIN}${suffix}`;
}

export function syncSeoMetadata(path: string, locale?: string | null) {
  const indexable = isIndexablePublicLocation(path, locale);
  const canonical = indexable ? absolutePublicUrl(path, locale) : absolutePublicUrl("/");

  let canonicalLink = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonicalLink) {
    canonicalLink = document.createElement("link");
    canonicalLink.rel = "canonical";
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.href = canonical;

  let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
  if (!robots) {
    robots = document.createElement("meta");
    robots.name = "robots";
    document.head.appendChild(robots);
  }
  robots.content = indexable ? "index,follow" : "noindex,nofollow";

  let ogUrl = document.querySelector<HTMLMetaElement>('meta[property="og:url"]');
  if (!ogUrl) {
    ogUrl = document.createElement("meta");
    ogUrl.name = "og:url";
    ogUrl.setAttribute("property", "og:url");
    document.head.appendChild(ogUrl);
  }
  ogUrl.content = canonical;

  document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(node => node.remove());
  if (!indexable) return;

  const alternates: Array<[string, string]> = [
    ["x-default", absolutePublicUrl(path)],
    ...INDEXABLE_LOCALES.map(code => [code, absolutePublicUrl(path, code)] as [string, string]),
  ];

  for (const [hreflang, href] of alternates) {
    const link = document.createElement("link");
    link.rel = "alternate";
    link.hreflang = hreflang;
    link.href = href;
    document.head.appendChild(link);
  }
}
