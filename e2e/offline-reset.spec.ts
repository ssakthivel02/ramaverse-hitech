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

  for (const failurePoint of ["keys", "delete"] as const) {
    test(`rejected cache ${failurePoint} shows a retryable error without losing private data`, async ({ page }) => {
      const pageErrors: string[] = [];
      page.on("pageerror", error => pageErrors.push(error.message));
      await page.goto("/offline-reset.html");
      await expect(page.getByRole("heading", { name: "Return to the RamaVerse" })).toBeVisible();
      await seedResetFixtures(page);
      // Fail one real window Cache Storage operation; worker blocking isolates the page handler.
      await page.evaluate(({ failurePoint, obsoleteCache }) => {
        let failOnce = true;
        if (failurePoint === "keys") {
          const original = caches.keys.bind(caches);
          caches.keys = async () => {
            if (failOnce) { failOnce = false; throw new Error("Injected cache enumeration failure"); }
            return original();
          };
        } else {
          const original = caches.delete.bind(caches);
          caches.delete = async name => {
            if (name === obsoleteCache && failOnce) { failOnce = false; throw new Error("Injected cache deletion failure"); }
            return original(name);
          };
        }
      }, { failurePoint, obsoleteCache });

      const button = page.getByRole("button", { name: "Reset offline shell" });
      await button.click();
      await expect(page.getByRole("status")).toHaveText("Offline shell could not be reset. Please try again.");
      await expect(button).toBeEnabled();
      await expect(page).toHaveURL("/offline-reset.html");
      const afterFailure = await page.evaluate(async ({ foreignCaches, probePath, privateLibrary }) => {
        const names = await caches.keys();
        const foreignBodies = [];
        for (const name of foreignCaches) {
          const response = names.includes(name) ? await (await caches.open(name)).match(probePath) : undefined;
          foreignBodies.push(response ? await response.text() : null);
        }
        return {
          names, foreignBodies,
          library: Object.fromEntries(Object.keys(privateLibrary).map(key => [key, localStorage.getItem(key)])),
        };
      }, { foreignCaches, probePath, privateLibrary });
      expect(afterFailure.names).toContain(obsoleteCache);
      expect(afterFailure.foreignBodies).toEqual(foreignCaches);
      expect(afterFailure.library).toEqual(privateLibrary);
      expect(pageErrors).toEqual([]);

      await resetAndVerify(page);
      expect(pageErrors).toEqual([]);
    });
  }
});
