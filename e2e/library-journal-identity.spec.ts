import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";

test("same-clock journal entries remain separately deletable through export and reload", async ({ page }) => {
  const errors: string[] = [];
  const duplicateKeys: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (message.text().includes("same key")) duplicateKeys.push(message.text()); });
  await page.addInitScript(() => { Date.now = () => 1000; });
  await page.goto("/library");
  await page.getByRole("button", { name: /^Spiritual Journal/ }).click();
  for (const title of ["First synthetic note", "Second synthetic note", "Third synthetic note"]) {
    await page.getByLabel("Title", { exact: true }).fill(title);
    await page.getByLabel("Spiritual Note", { exact: true }).fill("Synthetic reflection for " + title);
    await page.getByRole("button", { name: "Save Note Locally" }).click();
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
  }
  const before = await page.evaluate(() => JSON.parse(localStorage.getItem("ramaverse_journal") || "[]"));
  expect(before).toHaveLength(3);
  expect(new Set(before.map((note: { id: string }) => note.id)).size).toBe(3);
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export Backup" }).click();
  const path = await (await downloadPromise).path();
  if (!path) throw new Error("Missing backup download");
  expect(JSON.parse(await readFile(path, "utf8")).journalNotes).toEqual(before);
  const selected = page.locator("div.temple-card").filter({ has: page.getByRole("heading", { name: "Second synthetic note", exact: true }) });
  await selected.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Second synthetic note" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "First synthetic note" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Third synthetic note" })).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: /^Spiritual Journal/ }).click();
  await expect(page.getByRole("heading", { name: "First synthetic note" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Third synthetic note" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Second synthetic note" })).toHaveCount(0);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("ramaverse_journal") || "[]"))).toEqual(before.filter((note: { title: string }) => note.title !== "Second synthetic note"));
  expect(errors).toEqual([]);
  expect(duplicateKeys).toEqual([]);
});
