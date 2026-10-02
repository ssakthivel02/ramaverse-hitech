import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { describe, expect, it, vi } from "vitest";
import { registerGovernedServiceWorker } from "../client/src/lib/serviceWorkerRegistration";

const html = fs.readFileSync(path.resolve(import.meta.dirname, "../client/index.html"), "utf8");

function executeHtmlStartup(register: ReturnType<typeof vi.fn>) {
  const onLoad: (() => void)[] = [];
  const context = {
    navigator: { serviceWorker: { register } },
    window: {
      addEventListener: (type: string, handler: () => void) => {
        if (type === "load") onLoad.push(handler);
      },
    },
    console,
  };
  // Execute plain inline startup scripts in the trusted repository fixture.
  // The browser test also covers scripts with attributes and the built module.
  let start = html.indexOf("<script>");
  while (start >= 0) {
    const end = html.indexOf("</script>", start);
    expect(end).toBeGreaterThan(start);
    vm.runInNewContext(html.slice(start + "<script>".length, end), context);
    start = html.indexOf("<script>", end + "</script>".length);
  }
  for (const handler of onLoad) handler();
}

describe("service worker ownership across HTML and module bootstrap", () => {
  it("never registers from development startup, including HTML load handlers", async () => {
    const register = vi.fn().mockResolvedValue({});
    await registerGovernedServiceWorker({ isProduction: false, serviceWorker: { register } });
    executeHtmlStartup(register);
    expect(register).not.toHaveBeenCalled();
  });

  it("registers exactly once in production through the governed module", async () => {
    const register = vi.fn().mockResolvedValue({});
    await registerGovernedServiceWorker({ isProduction: true, serviceWorker: { register } });
    executeHtmlStartup(register);
    expect(register).toHaveBeenCalledTimes(1);
    expect(register).toHaveBeenCalledWith("/sw.js", { scope: "/" });
  });
});
