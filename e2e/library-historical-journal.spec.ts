import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";

const original = [
  { id: "note_1000", title: "First historical note", content: "Synthetic first reflection", timestamp: 1 },
  { id: "note_1000", title: "Second historical note", content: "Synthetic second reflection", timestamp: 2 },
  { id: "note_1000_1", title: "Reserved suffix note", content: "Synthetic suffix reflection", timestamp: 3 },
];

test("historical duplicate notes retain their content and become independently deletable on load and restore", async ({ page }) => {
  const errors: string[] = [];
  const duplicateKeys: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (message.text().includes("same key")) duplicateKeys.push(message.text()); });
  await page.goto("/offline-reset.html");
  await page.evaluate(notes => localStorage.setItem("ramaverse_journal", JSON.stringify(notes)), original);
  await page.goto("/library");
  await page.getByRole("button", { name: /^Spiritual Journal/ }).click();
  for (const note of original) await expect(page.getByRole("heading", { name: note.title, exact: true })).toBeVisible();
  const recovered = await page.evaluate(() => JSON.parse(localStorage.getItem("ramaverse_journal") || "[]"));
  expect(recovered).toEqual(original.map((note, index) => ({ ...note, id: index === 1 ? "note_1000_2" : note.id })));
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export Backup" }).click();
  const path = await (await downloadPromise).path();
  if (!path) throw new Error("Missing backup download");
  expect(JSON.parse(await readFile(path, "utf8")).journalNotes).toEqual(recovered);
  const second = page.locator("div.temple-card").filter({ has: page.getByRole("heading", { name: original[1].title, exact: true }) });
  await second.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(page.getByRole("heading", { name: original[1].title })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: original[0].title })).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: /^Spiritual Journal/ }).click();
  await expect(page.getByRole("heading", { name: original[0].title })).toBeVisible();
  await expect(page.getByRole("heading", { name: original[2].title })).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("ramaverse_journal") || "[]"))).toEqual([recovered[0], recovered[2]]);

  await page.getByLabel("Choose RamaVerse backup file").setInputFiles({
    name: "historical-synthetic-backup.json", mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify({ bookmarks: [], journalNotes: original, version: 1 })),
  });
  await expect(page.getByText("Backup restored to this browser.", { exact: true })).toBeVisible();
  for (const note of original) await expect(page.getByRole("heading", { name: note.title, exact: true })).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("ramaverse_journal") || "[]"))).toEqual(recovered);
  expect(errors).toEqual([]);
  expect(duplicateKeys).toEqual([]);
});
