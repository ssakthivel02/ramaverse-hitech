import { expect, test, type Page } from "@playwright/test";

async function openControlledHome(page: Page) {
  await page.goto("/");
  await expect(page.locator("#hero-title")).toBeVisible();
  await expect.poll(() => page.evaluate(() =>
    navigator.serviceWorker.controller?.state
  ), { timeout: 10_000 }).toBe("activated");
}

test("the installed worker controls the page and precaches the recovery shell", async ({ page }) => {
  await openControlledHome(page);
  const registration = await page.evaluate(async () => {
    const ready = await navigator.serviceWorker.ready;
    return { state: ready.active?.state, script: ready.active?.scriptURL, scope: ready.scope };
  });
  expect(registration.state).toBe("activated");
  expect(new URL(registration.script!).pathname).toBe("/sw.js");
  expect(new URL(registration.scope).pathname).toBe("/");
  await expect.poll(() => page.evaluate(async () => {
    const names = (await caches.keys()).filter(name => name.startsWith("ramaverse-cache-"));
    const paths = [];
    for (const name of names) {
      for (const request of await (await caches.open(name)).keys()) paths.push(new URL(request.url).pathname);
    }
    return ["/", "/manifest.json", "/offline-reset.html"].every(path => paths.includes(path));
  })).toBe(true);
});

test("a controlled online visit reloads its cached home offline without HTTP cache", async ({ page, context }) => {
  await openControlledHome(page);
  // The first navigation starts before worker control; warm assets under the activated worker.
  await page.reload();
  await expect(page.locator("#hero-title")).toBeVisible();
  await expect.poll(() => page.evaluate(async () => {
    const assets = [...document.querySelectorAll<HTMLScriptElement>("script[src]")].map(script => script.src)
      .concat([...document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')].map(link => link.href))
      .filter(url => new URL(url).origin === location.origin && new URL(url).pathname.startsWith("/assets/"));
    if (!assets.length) return ["NO_APP_ASSETS"];
    const cached = await Promise.all(assets.map(url => caches.match(url)));
    return assets.filter((_url, index) => !cached[index]);
  })).toEqual([]);
  const cdp = await context.newCDPSession(page);
  await cdp.send("Network.clearBrowserCache");
  await cdp.detach();
  await context.setOffline(true);
  try {
    await page.reload();
    await expect(page.locator("#hero-title")).toBeVisible();
    await expect(page.locator("main")).toBeVisible();
  } finally {
    await context.setOffline(false);
  }
});

test("offline navigation falls back to recovery when the cached home shell is missing", async ({ page, context }) => {
  await openControlledHome(page);
  await page.evaluate(async () => {
    for (const name of (await caches.keys()).filter(name => name.startsWith("ramaverse-cache-"))) {
      const cache = await caches.open(name);
      await cache.delete("/");
      await cache.delete("/index.html");
    }
  });
  await context.setOffline(true);
  try {
    await page.goto("/offline-unvisited-recovery-probe");
    await expect(page.getByRole("heading", { name: "Return to the RamaVerse" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Reset offline shell" })).toBeVisible();
  } finally {
    await context.setOffline(false);
  }
});

test("offline operational and API requests cannot return deliberately seeded cached responses", async ({ page, context }) => {
  await openControlledHome(page);
  const paths = ["/healthz", "/readyz", "/releasez", "/ops/probe", "/api/trpc/probe"];
  await page.evaluate(async paths => {
    const name = (await caches.keys()).find(name => name.startsWith("ramaverse-cache-"));
    if (!name) throw new Error("Governed cache missing");
    const cache = await caches.open(name);
    for (const path of paths) await cache.put(path, new Response("STALE_CACHED_PROBE"));
  }, paths);
  await context.setOffline(true);
  try {
    const results = await page.evaluate(async paths => Promise.all(paths.map(async path => {
      try { return await (await fetch(path)).text(); } catch { return "NETWORK_FAILURE"; }
    })), paths);
    expect(results).toEqual(paths.map(() => "NETWORK_FAILURE"));
  } finally {
    await context.setOffline(false);
  }
});
