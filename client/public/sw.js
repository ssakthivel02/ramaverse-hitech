const CACHE_NAME = "ramaverse-cache-v6";
const CACHE_PREFIX = "ramaverse-cache-";
const OFFLINE_URL = "/offline-reset.html";
const SHELL_URLS = ["/", "/index.html", "/manifest.json", "/favicon.svg", "/robots.txt", "/sitemap.xml", OFFLINE_URL];

const OPERATIONAL_PATHS = new Set(["/healthz", "/readyz", "/releasez"]);

function isOperationalPath(pathname) {
  return OPERATIONAL_PATHS.has(pathname) || pathname.startsWith("/ops/");
}

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_URLS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((names) => Promise.all(names.filter((name) => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME).map((name) => caches.delete(name)))));
  self.clients.claim();
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "CLEAR_CACHE") {
    event.waitUntil(caches.keys().then((names) => Promise.all(names.filter((name) => name.startsWith(CACHE_PREFIX)).map((name) => caches.delete(name)))));
  }
  if (event.data?.type === "GET_CACHE_VERSION") {
    event.ports?.[0]?.postMessage({ cacheName: CACHE_NAME });
  }
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  const isDevelopmentModule = url.pathname.startsWith("/@") || url.pathname.startsWith("/src/") || url.pathname.includes("/node_modules/");
  const excluded = request.method !== "GET" || url.origin !== self.location.origin || isDevelopmentModule || url.pathname.startsWith("/api/") || isOperationalPath(url.pathname) || url.pathname.includes("reconciliation") || url.pathname.toLowerCase().includes("staging");
  if (excluded) {
    event.respondWith(fetch(request));
    return;
  }

  const network = fetch(request);
  // Clone before returning the response body and keep the worker alive through the write.
  event.waitUntil(network.then((response) => {
    if (!response.ok) return;
    const copy = response.clone();
    return caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
  }).catch(() => undefined));

  if (request.mode === "navigate") {
    event.respondWith(network.catch(() => caches.match(request).then((cached) => cached || caches.match("/").then((shell) => shell || caches.match(OFFLINE_URL)))));
    return;
  }

  const refresh = network.catch(() => undefined);
  event.respondWith(caches.match(request).then((cached) => cached || refresh));
});
