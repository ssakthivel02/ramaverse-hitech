import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

async function expectNoSeriousAccessibilityViolations(page: Parameters<typeof AxeBuilder>[0]["page"]) {
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const blocking = results.violations.filter(({ impact }) => impact === "serious" || impact === "critical");
  expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
}

test("home renders the public knowledge shell and passes serious accessibility checks", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#hero-title")).toBeVisible();
  await expect(page.locator("main")).toBeVisible();
  await expect(page.locator("a.skip-link")).toHaveAttribute("href", "#main-content");
  await expectNoSeriousAccessibilityViolations(page);
});

test("localized public route renders and retains keyboard skip navigation", async ({ page }) => {
  await page.goto("/ta/");
  await expect(page.locator("#hero-title")).toBeVisible();
  await page.keyboard.press("Tab");
  const skipLink = page.locator("a.skip-link");
  await expect(skipLink).toBeFocused();
  await skipLink.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
});

test("unknown route fails safely into the application not-found surface", async ({ page }) => {
  await page.goto("/this-route-does-not-exist");
  await expect(page.locator("body")).toBeVisible();
  await expect(page.locator("#main-content")).toBeVisible();
  await expectNoSeriousAccessibilityViolations(page);
});
