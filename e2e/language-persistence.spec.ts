import { expect, test } from "@playwright/test";

test("localized routes retain correct document language and direction when preference writes fail", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.addInitScript(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key, value) {
      if (key === "ramaverse_lang") throw new DOMException("Synthetic quota rejection", "QuotaExceededError");
      return original.call(this, key, value);
    };
  });
  for (const [locale, direction] of [["ar", "rtl"], ["ur", "rtl"], ["ta", "ltr"]] as const) {
    await page.goto("/" + locale + "/library");
    await expect(page.getByRole("heading", { name: "Library & Journal" })).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await expect(page.locator("html")).toHaveAttribute("dir", direction);
    expect(await page.evaluate(() => localStorage.getItem("ramaverse_lang"))).toBeNull();
    await expect(page.locator("#main-content")).toBeVisible();
  }
  expect(errors).toEqual([]);
});
