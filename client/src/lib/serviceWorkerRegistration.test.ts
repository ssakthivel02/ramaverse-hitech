import { afterEach, describe, expect, it, vi } from "vitest";
import {
  canRegisterServiceWorker,
  registerGovernedServiceWorker,
} from "./serviceWorkerRegistration";

describe("governed service worker registration", () => {
  afterEach(() => vi.restoreAllMocks());

  it("registers the governed worker only in production when supported", async () => {
    const registration = {} as ServiceWorkerRegistration;
    const register = vi.fn().mockResolvedValue(registration);

    expect(canRegisterServiceWorker({ isProduction: true, serviceWorker: { register } })).toBe(true);
    await expect(registerGovernedServiceWorker({ isProduction: true, serviceWorker: { register } })).resolves.toBe(registration);
    expect(register).toHaveBeenCalledOnce();
    expect(register).toHaveBeenCalledWith("/sw.js", { scope: "/" });
  });

  it("does not register in development or test environments", async () => {
    const register = vi.fn();

    expect(canRegisterServiceWorker({ isProduction: false, serviceWorker: { register } })).toBe(false);
    await expect(registerGovernedServiceWorker({ isProduction: false, serviceWorker: { register } })).resolves.toBeUndefined();
    expect(register).not.toHaveBeenCalled();
  });

  it("does not register when the browser lacks service worker support", async () => {
    expect(canRegisterServiceWorker({ isProduction: true })).toBe(false);
    await expect(registerGovernedServiceWorker({ isProduction: true })).resolves.toBeUndefined();
  });

  it("fails safely when registration rejects", async () => {
    const error = new Error("registration blocked");
    const register = vi.fn().mockRejectedValue(error);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    await expect(registerGovernedServiceWorker({ isProduction: true, serviceWorker: { register } })).resolves.toBeUndefined();
    expect(warn).toHaveBeenCalledWith(
      "RamaVerse service worker registration failed; continuing without offline support.",
      error,
    );
  });
});
