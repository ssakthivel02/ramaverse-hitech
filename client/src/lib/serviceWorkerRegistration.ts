export type ServiceWorkerRegistrationEnvironment = {
  isProduction: boolean;
  serviceWorker?: Pick<ServiceWorkerContainer, "register">;
};

export function canRegisterServiceWorker({
  isProduction,
  serviceWorker,
}: ServiceWorkerRegistrationEnvironment) {
  return isProduction && Boolean(serviceWorker);
}

export async function registerGovernedServiceWorker({
  isProduction,
  serviceWorker,
}: ServiceWorkerRegistrationEnvironment): Promise<ServiceWorkerRegistration | undefined> {
  if (!canRegisterServiceWorker({ isProduction, serviceWorker })) return undefined;

  try {
    return await serviceWorker!.register("/sw.js", { scope: "/" });
  } catch (error) {
    console.warn("RamaVerse service worker registration failed; continuing without offline support.", error);
    return undefined;
  }
}

export function registerServiceWorkerForCurrentEnvironment() {
  const serviceWorker = typeof navigator !== "undefined" ? navigator.serviceWorker : undefined;
  return registerGovernedServiceWorker({
    isProduction: import.meta.env.PROD,
    serviceWorker,
  });
}
