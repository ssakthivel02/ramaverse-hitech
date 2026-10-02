import { readFile } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";

const fixture = {
  bookmarks: [{ id: "backup-bookmark", type: "sarga", itemId: "backup-fixture", title: "Backup bookmark", timestamp: 1 }],
  journalNotes: [{ id: "backup-note", title: "Backup journal", content: "Private backup fixture", timestamp: 1 }],
  readingProgress: [{ recordKey: "backup-fixture", updatedAt: 1 }],
};
const storageKeys = ["ramaverse_bookmarks", "ramaverse_journal", "ramaverse_sarga_progress"];

async function openSeededLibrary(page: Page) {
  // The standalone page has no React provider that could overwrite fixture storage.
  await page.goto("/offline-reset.html");
  await page.evaluate(data => {
    localStorage.setItem("ramaverse_bookmarks", JSON.stringify(data.bookmarks));
    localStorage.setItem("ramaverse_journal", JSON.stringify(data.journalNotes));
    localStorage.setItem("ramaverse_sarga_progress", JSON.stringify(data.readingProgress));
  }, fixture);
  await page.goto("/library");
  await expect(page.getByRole("heading", { name: "Library & Journal" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Backup bookmark" })).toBeVisible();
}

async function storedLibrary(page: Page) {
  return page.evaluate(keys => keys.map(key => JSON.parse(localStorage.getItem(key) || "null")), storageKeys);
}

test("exported private library survives clear, restore and reload", async ({ page }) => {
  await openSeededLibrary(page);
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export Backup" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^ramaverse_backup_\d+\.json$/);
  const filePath = await download.path();
  if (!filePath) throw new Error("Backup download missing");
  const backupText = await readFile(filePath, "utf8");
  const backup = JSON.parse(backupText);
  expect(backup).toMatchObject({ ...fixture, version: 2 });
  expect(Number.isFinite(Date.parse(backup.exportedAt))).toBe(true);

  page.once("dialog", dialog => dialog.dismiss());
  await page.getByRole("button", { name: "Clear All", exact: true }).click();
  expect(await storedLibrary(page)).toEqual(Object.values(fixture));

  page.once("dialog", dialog => dialog.accept());
  await page.getByRole("button", { name: "Clear All", exact: true }).click();
  await expect(page.getByRole("heading", { name: "No Bookmarks Saved Yet" })).toBeVisible();
  await expect.poll(() => storedLibrary(page)).toEqual([[], [], []]);

  await page.getByLabel("Choose RamaVerse backup file").setInputFiles({
    name: download.suggestedFilename(), mimeType: "application/json", buffer: Buffer.from(backupText),
  });
  await expect(page.getByText("Backup restored to this browser.", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Backup bookmark" })).toBeVisible();
  await page.getByRole("button", { name: /Spiritual Journal/ }).click();
  await expect(page.getByRole("heading", { name: "Backup journal" })).toBeVisible();
  await expect(page.getByText("Private backup fixture", { exact: true })).toBeVisible();
  await expect.poll(() => storedLibrary(page)).toEqual(Object.values(fixture));

  await page.reload();
  await expect(page.getByRole("heading", { name: "Backup bookmark" })).toBeVisible();
  expect(await storedLibrary(page)).toEqual(Object.values(fixture));
});

test("invalid backups preserve existing data and the same file name can be retried", async ({ page }) => {
  await openSeededLibrary(page);
  const picker = page.getByLabel("Choose RamaVerse backup file");
  const before = await storedLibrary(page);
  const invalidFiles = [
    "{invalid-json",
    JSON.stringify({ bookmarks: [null], journalNotes: [] }),
    JSON.stringify({ ...fixture, journalNotes: [{ ...fixture.journalNotes[0], content: {} }] }),
    JSON.stringify({ bookmarks: [], journalNotes: [], readingProgress: [null] }),
  ];
  for (const content of invalidFiles) {
    await picker.setInputFiles({ name: "retry-backup.json", mimeType: "application/json", buffer: Buffer.from(content) });
    await expect(page.getByRole("alert")).toHaveText("Backup could not be restored. Choose a RamaVerse JSON backup file.");
    await expect(page.getByRole("heading", { name: "Backup bookmark" })).toBeVisible();
    expect(await storedLibrary(page)).toEqual(before);
    await expect(picker).toHaveValue("");
  }
  const replacement = { ...fixture, bookmarks: [{ ...fixture.bookmarks[0], title: "Retried bookmark" }] };
  await picker.setInputFiles({ name: "retry-backup.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(replacement)) });
  await expect(page.getByText("Backup restored to this browser.", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Retried bookmark" })).toBeVisible();
  await expect.poll(() => storedLibrary(page)).toEqual(Object.values(replacement));
});
