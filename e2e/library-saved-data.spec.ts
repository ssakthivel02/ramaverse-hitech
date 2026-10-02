import { expect, test, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";

const keys = ["ramaverse_bookmarks", "ramaverse_journal", "ramaverse_sarga_progress"];
const note = { id: "n1", title: "Existing journal", content: "Synthetic reflection", timestamp: 1 };
const bookmark = { id: "b1", type: "sarga", itemId: "fixture", title: "Restored bookmark", timestamp: 1 };
const warning = "Some saved library data could not be read and has been left unchanged. Changes to affected collections will not be saved until you restore a valid backup or clear the library. Export a backup of this session before leaving.";

async function seed(page: Page, values: string[]) {
  await page.goto("/offline-reset.html");
  await page.evaluate(({ keys, values }) => {
    keys.forEach((key, index) => localStorage.setItem(key, values[index]));
  }, { keys, values });
  await page.goto("/library");
  await expect(page.getByRole("heading", { name: "Library & Journal" })).toBeVisible();
  await expect(page.getByRole("alert")).toHaveText(warning);
}
async function rawStored(page: Page) {
  return page.evaluate(keys => keys.map(key => localStorage.getItem(key)), keys);
}
async function exported(page: Page) {
  const downloaded = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export Backup" }).click();
  const path = await (await downloaded).path();
  if (!path) throw new Error("Missing backup download");
  return JSON.parse(await readFile(path, "utf8"));
}

test("unreadable bookmarks and progress do not block journal editing, export or explicit restore", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await seed(page, ["null", JSON.stringify([note]), "[null]"]);
  await expect(page.getByRole("heading", { name: "No Bookmarks Saved Yet" })).toBeVisible();
  await page.getByRole("button", { name: /^Spiritual Journal/ }).click();
  await expect(page.getByRole("heading", { name: "Existing journal" })).toBeVisible();
  await page.getByLabel("Title", { exact: true }).fill("Session reflection");
  await page.getByLabel("Spiritual Note", { exact: true }).fill("Synthetic new note");
  await page.getByRole("button", { name: "Save Note Locally" }).click();
  await expect(page.getByRole("heading", { name: "Session reflection" })).toBeVisible();
  const raw = await rawStored(page);
  expect(raw[0]).toBe("null");
  expect(raw[2]).toBe("[null]");
  expect(JSON.parse(raw[1] || "null").map((item: { title: string }) => item.title)).toEqual(["Session reflection", "Existing journal"]);
  const backup = await exported(page);
  expect(backup.bookmarks).toEqual([]);
  expect(backup.readingProgress).toEqual([]);
  expect(backup.journalNotes.map((item: { title: string }) => item.title)).toEqual(["Session reflection", "Existing journal"]);
  await page.reload();
  await expect(page.getByRole("alert")).toHaveText(warning);
  await page.getByRole("button", { name: /^Spiritual Journal/ }).click();
  await expect(page.getByRole("heading", { name: "Session reflection" })).toBeVisible();

  await page.getByLabel("Choose RamaVerse backup file").setInputFiles({
    name: "synthetic-backup.json", mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify({ bookmarks: [bookmark], journalNotes: [note], readingProgress: [] })),
  });
  await expect(page.getByText("Backup restored to this browser.", { exact: true })).toBeVisible();
  await expect(page.getByRole("alert")).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Restored bookmark" })).toBeVisible();
  expect(await rawStored(page)).toEqual([JSON.stringify([bookmark]), JSON.stringify([note]), "[]"]);
  expect(errors).toEqual([]);
});

test("a session edit cannot overwrite unreadable journal data until the user explicitly clears", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  const rawJournal = "{broken";
  await seed(page, [JSON.stringify([bookmark]), rawJournal, "[]"]);
  await expect(page.getByRole("heading", { name: "Restored bookmark" })).toBeVisible();
  await page.getByRole("button", { name: /^Spiritual Journal/ }).click();
  await page.getByLabel("Title", { exact: true }).fill("Unsaved session note");
  await page.getByLabel("Spiritual Note", { exact: true }).fill("Synthetic temporary reflection");
  await page.getByRole("button", { name: "Save Note Locally" }).click();
  await expect(page.getByRole("heading", { name: "Unsaved session note" })).toBeVisible();
  expect((await rawStored(page))[1]).toBe(rawJournal);
  const backup = await exported(page);
  expect(backup.journalNotes.map((item: { title: string }) => item.title)).toEqual(["Unsaved session note"]);
  page.once("dialog", dialog => dialog.accept());
  await page.getByRole("button", { name: "Clear All" }).click();
  await expect(page.getByRole("alert")).toHaveCount(0);
  await expect.poll(() => rawStored(page)).toEqual(["[]", "[]", "[]"]);
  await page.getByLabel("Title", { exact: true }).fill("Saved after clear");
  await page.getByLabel("Spiritual Note", { exact: true }).fill("Synthetic saved reflection");
  await page.getByRole("button", { name: "Save Note Locally" }).click();
  await page.reload();
  await page.getByRole("button", { name: /^Spiritual Journal/ }).click();
  await expect(page.getByRole("heading", { name: "Saved after clear" })).toBeVisible();
  await expect(page.getByRole("alert")).toHaveCount(0);
  expect(errors).toEqual([]);
});
