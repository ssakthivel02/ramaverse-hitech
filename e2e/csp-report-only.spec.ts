import { expect, test, type Page } from "@playwright/test";

const routes = [
  "/", "/ta/", "/kandas", "/wisdom", "/characters", "/places", "/guidance", "/stories", "/quizzes", "/audio",
  "/search", "/ask", "/intelligence", "/library", "/journey", "/timeline", "/knowledge", "/rama-life",
  "/walk-with-rama", "/experience-center", "/sargas/VR-IITK-BALA-001", "/no-such-route",
];

type Violation = { directive: string; blocked: string; source: string };

async function collectViolations(page: Page) {
  await page.addInitScript(() => {
    (window as unknown as { __cspViolations: Violation[] }).__cspViolations = [];
    document.addEventListener("securitypolicyviolation", event => {
      (window as unknown as { __cspViolations: Violation[] }).__cspViolations.push({
        directive: event.effectiveDirective,
        blocked: event.blockedURI,
        source: `${event.sourceFile}:${event.lineNumber}`,
      });
    });
  });
}

test("served report-only CSP is the strict candidate without unsafe script allowances", async ({ request }) => {
  const response = await request.get("/");
  const csp = response.headers()["content-security-policy-report-only"];
  expect(csp).toBeTruthy();
  expect(response.headers()["content-security-policy"]).toBeUndefined();
  const scriptSrc = csp.split(";").map(part => part.trim()).find(part => part.startsWith("script-src"));
  expect(scriptSrc).toBe("script-src 'self'");
  expect(csp).not.toContain("unsafe-eval");
  expect(csp).toContain("object-src 'none'");
});

// The service worker has its own CSP context: violations there never reach the page's listener.
for (const route of ["/", "/ta/", "/search"]) {
  test(`no CSP violations in the service worker or page on a SW-controlled load of ${route}`, async ({ page, context }) => {
    await collectViolations(page);
    await page.goto(route);
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => navigator.serviceWorker.ready);
    let worker = context.serviceWorkers()[0];
    if (!worker) worker = await context.waitForEvent("serviceworker", { timeout: 10_000 });
    await worker.evaluate(() => {
      const scope = self as unknown as { __cspViolations: string[] };
      scope.__cspViolations = [];
      self.addEventListener("securitypolicyviolation", event => {
        scope.__cspViolations.push(`${event.effectiveDirective} ${event.blockedURI}`);
      });
    });
    await page.reload();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1_000);
    // Guard against a vacuous pass: the reloaded page must actually be controlled by the worker.
    expect(await page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
    const workerViolations = await worker.evaluate(() => (self as unknown as { __cspViolations: string[] }).__cspViolations);
    const pageViolations = await page.evaluate(() => (window as unknown as { __cspViolations: Violation[] }).__cspViolations);
    expect(workerViolations, JSON.stringify(workerViolations, null, 2)).toEqual([]);
    expect(pageViolations, JSON.stringify(pageViolations, null, 2)).toEqual([]);
  });
}

for (const route of routes) {
  test(`no CSP violations against the report-only candidate on ${route}`, async ({ page }) => {
    await collectViolations(page);
    await page.goto(route);
    await page.waitForLoadState("networkidle");
    // Exercise basic keyboard navigation so lazily created UI is also covered.
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    const violations = await page.evaluate(() => (window as unknown as { __cspViolations: Violation[] }).__cspViolations);
    expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
  });
}
