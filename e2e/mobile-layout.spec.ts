import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const routes = [
  "/", "/ta/", "/kandas", "/wisdom", "/characters", "/places", "/guidance", "/stories", "/quizzes", "/audio",
  "/search", "/ask", "/intelligence", "/library", "/journey", "/timeline", "/knowledge", "/rama-life",
  "/walk-with-rama", "/experience-center", "/sargas/VR-IITK-BALA-001", "/no-such-route",
];
const viewports = [
  { name: "phone-360", width: 360, height: 740, isMobile: true },
  { name: "tablet-768", width: 768, height: 1024, isMobile: false },
];
for (const viewport of viewports) {
  test.describe(`${viewport.name} layout and accessibility`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height }, isMobile: viewport.isMobile, hasTouch: true });
    for (const route of routes) {
      test(`${route} has no horizontal overflow and no serious accessibility violations`, async ({ page }) => {
        await page.goto(route);
        await page.waitForLoadState("networkidle");
        const { scrollWidth, clientWidth, offenders } = await page.evaluate(() => {
          const width = document.documentElement.clientWidth;
          return {
            scrollWidth: document.documentElement.scrollWidth, clientWidth: width,
            offenders: [...document.querySelectorAll("body *")]
              .filter(element => element.getBoundingClientRect().right > width + 1)
              .slice(0, 5).map(element => `${element.tagName}.${String(element.className).slice(0, 60)} "${(element.textContent ?? "").trim().slice(0, 30)}"`),
          };
        });
        expect(scrollWidth, `page scrolls sideways at ${viewport.width}px; offenders: ${JSON.stringify(offenders)}`).toBeLessThanOrEqual(clientWidth + 1);
        const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
        const blocking = results.violations.filter(({ impact }) => impact === "serious" || impact === "critical");
        expect(blocking.map(({ id, nodes }) => `${id} (${nodes.length})`), JSON.stringify(blocking.map(({ id, help }) => ({ id, help })))).toEqual([]);
      });
    }
  });
}
