const CACHE_NAME = "ramaverse-cache-v5";
const CACHE_PREFIX = "ramaverse-cache-";
const OFFLINE_URL = "/offline-reset.html";
const SHELL_URLS = ["/", "/index.html", "/manifest.json", "/favicon.svg", "/robots.txt", "/sitemap.xml", OFFLINE_URL];

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
    event.waitUntil(caches.keys().then((names) => Promise.all(names.map((name) => caches.delete(name)))));
  }
  if (event.data?.type === "GET_CACHE_VERSION") {
    event.ports?.[0]?.postMessage({ cacheName: CACHE_NAME });
  }
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  const isDevelopmentModule = url.pathname.startsWith("/@") || url.pathname.startsWith("/src/") || url.pathname.includes("/node_modules/");
  const excluded = request.method !== "GET" || url.origin !== self.location.origin || isDevelopmentModule || url.pathname.startsWith("/api/") || url.pathname.includes("reconciliation") || url.pathname.toLowerCase().includes("staging");
  if (excluded) {
    event.respondWith(fetch(request));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(fetch(request).then((response) => {
      if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
      return response;
    }).catch(() => caches.match(request).then((cached) => cached || caches.match("/").then((shell) => shell || caches.match(OFFLINE_URL)))));
    return;
  }

  event.respondWith(caches.match(request).then((cached) => {
    const network = fetch(request).then((response) => {
      if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
      return response;
    });
    return cached || network.catch(() => undefined);
  }));
});
