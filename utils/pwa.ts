export type ServiceWorkerResult = 'registered' | 'skipped';

interface WebServiceWorkerRegistration {
  unregister: () => Promise<unknown>;
}

interface WebNavigator {
  serviceWorker?: {
    register: (url: string) => Promise<unknown>;
    getRegistrations?: () => Promise<WebServiceWorkerRegistration[]>;
  };
  vibrate?: (pattern: number) => boolean;
}

/**
 * Registra el service worker offline solo en builds web de producción.
 * En dev desregistra workers previos y omite: un SW cacheado serviría
 * bundles viejos y rompería el hot reload.
 * En nativo (sin serviceWorker en navigator) resuelve 'skipped'.
 */
export async function registerServiceWorker(): Promise<ServiceWorkerResult> {
  try {
    const webNavigator =
      typeof navigator === 'undefined' ? undefined : (navigator as unknown as WebNavigator);
    const container = webNavigator?.serviceWorker;
    if (!container) {
      return 'skipped';
    }
    if (process.env.NODE_ENV !== 'production') {
      const registrations = await container.getRegistrations?.();
      await Promise.all((registrations ?? []).map((registration) => registration.unregister()));
      return 'skipped';
    }
    await container.register('/sw.js');
    return 'registered';
  } catch {
    return 'skipped';
  }
}
