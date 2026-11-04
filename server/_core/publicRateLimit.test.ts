import { describe, expect, it, vi } from "vitest";
import { expensivePublicProcedure, router } from "./trpc";

describe("expensive public tRPC request protection", () => {
  it("returns TOO_MANY_REQUESTS and Retry-After after 60 requests", async () => {
    const res = { setHeader: vi.fn() };
    const request = { socket: { remoteAddress: "198.51.100.143" }, headers: { "x-forwarded-for": "1.2.3.4" } };
    const caller = router({ search: expensivePublicProcedure.query(() => "ok") })
      .createCaller({ req: request, res, user: null } as any);
    for (let i = 0; i < 60; i++) {
      expect(await caller.search()).toBe("ok");
    }
    await expect(caller.search()).rejects.toMatchObject({ code: "TOO_MANY_REQUESTS" });
    expect(res.setHeader).toHaveBeenCalledWith("Retry-After", expect.any(String));
    expect(res.setHeader).toHaveBeenCalledWith("Cache-Control", "no-store");
  });
});
