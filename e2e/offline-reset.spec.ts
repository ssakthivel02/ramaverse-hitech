import { expect, test, type Page } from "@playwright/test";

const obsoleteCache = "ramaverse-cache-reset-browser-obsolete";
const foreignCaches = ["other-app-cache", "ramaverse-cache", "ramaverse-cacheevil"];
const probePath = "/reset-cache-browser-probe";
const privateLibrary = {
  ramaverse_bookmarks: JSON.stringify([{ id: "reset-bookmark", type: "sarga", itemId: "reset-fixture", title: "Preserved bookmark", timestamp: 1 }]),
  ramaverse_journal: JSON.stringify([{ id: "reset-note", title: "Preserved journal", content: "Private reset fixture", timestamp: 1 }]),
  ramaverse_sarga_progress: JSON.stringify([{ recordKey: "reset-fixture", updatedAt: 1 }]),
};

async function seedResetFixtures(page: Page) {
  await page.evaluate(async ({ obsoleteCache, foreignCaches, probePath, privateLibrary }) => {
    for (const [key, value] of Object.entries(privateLibrary)) localStorage.setItem(key, value);
    const ownedNames = (await caches.keys()).filter(name => name.startsWith("ramaverse-cache-"));
    for (const name of [...new Set([...ownedNames, obsoleteCache]), ...foreignCaches]) {
      await (await caches.open(name)).put(probePath, new Response(name));
    }
  }, { obsoleteCache, foreignCaches, probePath, privateLibrary });
}

async function resetAndVerify(page: Page) {
  await seedResetFixtures(page);
  await page.getByRole("button", { name: "Reset offline shell" }).click();
  await expect(page.getByRole("status")).toHaveText("Offline shell reset. Returning home…");
  await expect(page).toHaveURL("/");
  await expect(page.locator("#hero-title")).toBeVisible();

  const result = await page.evaluate(async ({ obsoleteCache, foreignCaches, probePath, privateLibrary }) => {
    const names = await caches.keys();
    const ownedProbeBodies = [];
    for (const name of names.filter(name => name.startsWith("ramaverse-cache-"))) {
      const response = await (await caches.open(name)).match(probePath);
      if (response) ownedProbeBodies.push(await response.text());
    }
    const foreignProbeBodies = [];
    for (const name of foreignCaches) {
      // Do not open a missing cache: that would recreate it and conceal deletion.
      const response = names.includes(name) ? await (await caches.open(name)).match(probePath) : undefined;
      foreignProbeBodies.push(response ? await response.text() : null);
    }
    return {
      obsoletePresent: names.includes(obsoleteCache),
      ownedProbeBodies,
      foreignProbeBodies,
      library: Object.fromEntries(Object.keys(privateLibrary).map(key => [key, localStorage.getItem(key)])),
    };
  }, { obsoleteCache, foreignCaches, probePath, privateLibrary });

  expect(result.obsoletePresent).toBe(false);
  // Home can recreate the active cache; stale probe content must still be gone.
  expect(result.ownedProbeBodies).toEqual([]);
  expect(result.foreignProbeBodies).toEqual(foreignCaches);
  expect(result.library).toEqual(privateLibrary);
}

test("controlled recovery reset clears owned caches, preserves private data and returns home", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#hero-title")).toBeVisible();
  await expect.poll(() => page.evaluate(() => navigator.serviceWorker.controller?.state)).toBe("activated");
  await page.goto("/offline-reset.html");
  await expect(page.getByRole("heading", { name: "Return to the RamaVerse" })).toBeVisible();
  expect(await page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  await resetAndVerify(page);
  await expect.poll(() => page.evaluate(() => navigator.serviceWorker.controller?.state)).toBe("activated");
});

test.describe("standalone recovery without a service worker", () => {
  test.use({ serviceWorkers: "block" });

  test("reset preserves unrelated caches and private data before reopening the online home", async ({ page }) => {
    await page.goto("/offline-reset.html");
    await expect(page.getByRole("heading", { name: "Return to the RamaVerse" })).toBeVisible();
    expect(await page.evaluate(() => navigator.serviceWorker.controller)).toBeNull();
    await resetAndVerify(page);
    expect(await page.evaluate(() => navigator.serviceWorker.controller)).toBeNull();
  });
});
