import { readFile } from "node:fs/promises";
import { expect, test, type BrowserContext, type Page } from "@playwright/test";

const fixture = {
  bookmarks: [{ id: "seed-b", type: "sarga", itemId: "seed", title: "Seed bookmark", timestamp: 1 }],
  journalNotes: [{ id: "seed-n", title: "Seed note", content: "Private fixture", timestamp: 1 }],
  readingProgress: [{ recordKey: "seed", updatedAt: 1 }],
};
const keys = ["ramaverse_bookmarks", "ramaverse_journal", "ramaverse_sarga_progress"];
const warning = "Browser storage could not save your library changes. Changes may not survive a reload. Export a backup before leaving.";

async function openWithBlockedStorage(page: Page, context: BrowserContext, blockRemoval = false) {
  await page.goto("/offline-reset.html");
  await page.evaluate(({ keys, fixture }) => {
    Object.values(fixture).forEach((value, index) => localStorage.setItem(keys[index], JSON.stringify(value)));
  }, { keys, fixture });
  // Only library operations fail; theme/language storage remains independently usable.
  await context.addInitScript(({ keys, blockRemoval }) => {
    Reflect.set(window, "__libraryStorageBlocked", true);
    const setItem = Storage.prototype.setItem;
    const removeItem = Storage.prototype.removeItem;
    Storage.prototype.setItem = function(key, value) {
      if (Reflect.get(window, "__libraryStorageBlocked") && keys.includes(key)) throw new DOMException("Injected quota failure", "QuotaExceededError");
      setItem.call(this, key, value);
    };
    Storage.prototype.removeItem = function(key) {
      if (blockRemoval && Reflect.get(window, "__libraryStorageBlocked") && keys.includes(key)) throw new DOMException("Injected removal failure", "SecurityError");
      removeItem.call(this, key);
    };
  }, { keys, blockRemoval });
  await page.goto("/library");
  await expect(page.getByRole("heading", { name: "Library & Journal" })).toBeVisible();
  await expect(page.getByRole("alert")).toHaveText(warning);
}
async function stored(page: Page) {
  return page.evaluate(keys => keys.map(key => JSON.parse(localStorage.getItem(key) || "null")), keys);
}
async function exportBackup(page: Page) {
  const promise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export Backup" }).click();
  const file = await (await promise).path();
  if (!file) throw new Error("Backup missing");
  return JSON.parse(await readFile(file, "utf8"));
}

test("failed writes retain exportable journal changes and later storage recovery saves them", async ({ page, context }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await openWithBlockedStorage(page, context);
  await page.getByRole("button", { name: /Spiritual Journal/ }).click();
  await page.getByLabel("Title", { exact: true }).fill("Session note");
  await page.getByLabel("Spiritual Note").fill("Unsaved reflection");
  await page.getByRole("button", { name: "Save Note Locally" }).click();
  await expect(page.getByRole("heading", { name: "Session note" })).toBeVisible();
  expect(await stored(page)).toEqual(Object.values(fixture));
  const backup = await exportBackup(page);
  expect(backup.bookmarks).toEqual(fixture.bookmarks);
  expect(backup.readingProgress).toEqual(fixture.readingProgress);
  expect(backup.journalNotes.map((note: { title: string }) => note.title)).toEqual(["Session note", "Seed note"]);

  await page.evaluate(() => Reflect.set(window, "__libraryStorageBlocked", false));
  await page.getByLabel("Title", { exact: true }).fill("Recovered note");
  await page.getByLabel("Spiritual Note").fill("Now persisted");
  await page.getByRole("button", { name: "Save Note Locally" }).click();
  await expect(page.getByRole("alert")).toHaveCount(0);
  await expect.poll(() => page.evaluate(() =>
    JSON.parse(localStorage.getItem("ramaverse_journal") || "[]").map((note: { title: string }) => note.title)
  )).toEqual(["Recovered note", "Session note", "Seed note"]);

  await page.reload();
  await expect(page.getByRole("heading", { name: "Seed bookmark" })).toBeVisible();
  await page.getByRole("button", { name: /Spiritual Journal/ }).click();
  await expect(page.getByRole("heading", { name: "Session note" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Recovered note" })).toBeVisible();
  expect(errors).toEqual([]);
});

test("restore feedback is session-only and rejected clear operations remain usable", async ({ page, context }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await openWithBlockedStorage(page, context, true);
  const replacement = { ...fixture, bookmarks: [{ ...fixture.bookmarks[0], title: "Restored bookmark" }] };
  await page.getByLabel("Choose RamaVerse backup file").setInputFiles({
    name: "session-backup.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(replacement)),
  });
  await expect(page.getByText("Backup loaded for this session. Browser storage could not save it; export a backup before leaving.", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Restored bookmark" })).toBeVisible();
  await expect(page.getByText("Backup restored to this browser.", { exact: true })).toHaveCount(0);
  expect(await stored(page)).toEqual(Object.values(fixture));
  expect((await exportBackup(page)).bookmarks).toEqual(replacement.bookmarks);

  page.once("dialog", dialog => dialog.accept());
  await page.getByRole("button", { name: "Clear All", exact: true }).click();
  await expect(page.getByRole("heading", { name: "No Bookmarks Saved Yet" })).toBeVisible();
  await expect(page.getByRole("alert")).toHaveText(warning);
  expect(await stored(page)).toEqual(Object.values(fixture));
  expect(errors).toEqual([]);
});
