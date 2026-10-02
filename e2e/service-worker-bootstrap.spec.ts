import { expect, test } from "@playwright/test";

test("production startup registers the governed service worker once", async ({ page }) => {
  await page.addInitScript(() => {
    const calls: { scriptURL: string; scope?: string }[] = [];
    Reflect.set(window, "__ramaverseServiceWorkerCalls", calls);
    const register = navigator.serviceWorker.register.bind(navigator.serviceWorker);
    navigator.serviceWorker.register = (scriptURL, options) => {
      calls.push({ scriptURL: String(scriptURL), scope: options?.scope });
      return register(scriptURL, options);
    };
  });

  await page.goto("/");
  await expect.poll(() => page.evaluate(() =>
    Reflect.get(window, "__ramaverseServiceWorkerCalls")
  )).toEqual([{ scriptURL: "/sw.js", scope: "/" }]);
});
