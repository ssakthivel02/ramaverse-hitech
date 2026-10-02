import { expect, test, type Page } from "@playwright/test";

const older = {
  bookmarks: [{ id: "old", type: "sarga", itemId: "old", title: "Older backup bookmark", timestamp: 1 }],
  journalNotes: [], readingProgress: [],
};
const newer = {
  bookmarks: [{ id: "new", type: "sarga", itemId: "new", title: "Newer backup bookmark", timestamp: 2 }],
  journalNotes: [], readingProgress: [],
};

async function holdSlowRead(page: Page) {
  await page.addInitScript(() => {
    const original = File.prototype.text;
    File.prototype.text = function() {
      if (this.name !== "slow.json") return original.call(this);
      return new Promise<string>(resolve => { Reflect.set(window, "__finishLibraryRead", resolve); });
    };
  });
  await page.goto("/library");
  await expect(page.getByRole("heading", { name: "Library & Journal" })).toBeVisible();
  await page.getByLabel("Choose RamaVerse backup file").setInputFiles({
    name: "slow.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(older)),
  });
  await expect(page.getByText("Reading backup file…", { exact: true })).toBeVisible();
}
async function finishSlowRead(page: Page) {
  await page.evaluate(json => Reflect.get(window, "__finishLibraryRead")(json), JSON.stringify(older));
}

test("confirmed clear stays cleared when an older backup read completes", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await holdSlowRead(page);
  page.once("dialog", dialog => dialog.accept());
  await page.getByRole("button", { name: "Clear All" }).click();
  await finishSlowRead(page);
  await expect(page.getByText("Reading backup file…", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "No Bookmarks Saved Yet" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Older backup bookmark" })).toHaveCount(0);
  await expect(page.getByText("Backup restored to this browser.", { exact: true })).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole("heading", { name: "No Bookmarks Saved Yet" })).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("ramaverse_bookmarks") || "null"))).toEqual([]);
  expect(errors).toEqual([]);
});

test("the newer backup remains restored after an older read completes and reloads", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await holdSlowRead(page);
  await page.getByLabel("Choose RamaVerse backup file").setInputFiles({
    name: "newer.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(newer)),
  });
  await expect(page.getByRole("heading", { name: "Newer backup bookmark" })).toBeVisible();
  await finishSlowRead(page);
  await expect(page.getByRole("heading", { name: "Older backup bookmark" })).toHaveCount(0);
  await expect(page.getByText("Backup restored to this browser.", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Newer backup bookmark" })).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("ramaverse_bookmarks") || "null"))).toEqual(newer.bookmarks);
  expect(errors).toEqual([]);
});
