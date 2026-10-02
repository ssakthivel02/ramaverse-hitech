import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { describe, expect, it } from "vitest";

const html = fs.readFileSync(path.resolve(import.meta.dirname, "../client/public/offline-reset.html"), "utf8");
const script = html.slice(html.indexOf("<script>") + "<script>".length, html.indexOf("</script>"));
const failureText = "Offline shell could not be reset. Please try again.";
const owned = ["ramaverse-cache-v5", "ramaverse-cache-v6"];
const foreign = "other-app-cache";

function recoveryHarness(failure: "keys" | "delete" | "message" | "missing" | "none", gate?: Promise<void>) {
  let failOnce = true;
  const names = new Set([...owned, foreign]);
  const deleted: string[] = [];
  let keyCalls = 0;
  let timers = 0;
  let click: () => Promise<void>;
  const status = { textContent: "" };
  const button = { disabled: false, addEventListener: (_event: string, handler: typeof click) => { click = handler; } };
  const caches = {
    keys: async () => {
      keyCalls++;
      if (gate) await gate;
      if (failure === "keys" && failOnce) { failOnce = false; throw new Error("Cache enumeration failed"); }
      return [...names];
    },
    delete: async (name: string) => {
      if (failure === "delete" && name === owned[1] && failOnce) { failOnce = false; throw new Error("Cache deletion failed"); }
      deleted.push(name);
      return names.delete(name);
    },
  };
  vm.runInNewContext(script, {
    caches,
    window: { caches: failure === "missing" ? undefined : caches },
    navigator: failure === "message" ? { serviceWorker: { controller: { postMessage: () => {
      if (failOnce) { failOnce = false; throw new Error("Worker message failed"); }
    } } } } : {},
    document: { getElementById: (id: string) => id === "status" ? status : button },
    setTimeout: () => { timers++; return 0; },
  });
  return {
    click: () => click(),
    status, button, names, deleted,
    keyCalls: () => keyCalls,
    timers: () => timers,
  };
}

describe("Offline reset failure and retry", () => {
  for (const failure of ["keys", "delete", "message"] as const) {
    it(`reports ${failure} failure without redirect and allows a successful retry`, async () => {
      const page = recoveryHarness(failure);
      await expect(page.click()).resolves.toBeUndefined();
      expect(page.status.textContent).toBe(failureText);
      expect(page.button.disabled).toBe(false);
      expect(page.timers()).toBe(0);
      expect(page.names.has(foreign)).toBe(true);
      expect(page.names.has(owned[1])).toBe(true);

      await page.click();
      expect(page.status.textContent).toBe("Offline shell reset. Returning home…");
      expect(page.button.disabled).toBe(true);
      expect(page.timers()).toBe(1);
      expect([...page.names]).toEqual([foreign]);
      expect(page.deleted).not.toContain(foreign);
    });
  }

  it("does not claim success when Cache Storage is unavailable", async () => {
    const page = recoveryHarness("missing");
    await page.click();
    expect(page.status.textContent).toBe(failureText);
    expect(page.timers()).toBe(0);
    expect(page.button.disabled).toBe(false);
    expect(page.deleted).toEqual([]);
  });

  it("accepts one reset operation while storage work is pending", async () => {
    let release!: () => void;
    const gate = new Promise<void>(resolve => { release = resolve; });
    const page = recoveryHarness("none", gate);
    const first = page.click();
    expect(page.button.disabled).toBe(true);
    expect(page.status.textContent).toBe("Resetting offline shell…");
    const duplicate = page.click();
    release();
    await Promise.all([first, duplicate]);
    expect(page.keyCalls()).toBe(1);
    expect(page.deleted).toEqual(owned);
    expect(page.timers()).toBe(1);
  });
});
