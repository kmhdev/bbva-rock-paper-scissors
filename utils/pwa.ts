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
 * Registers the offline service worker on web production builds only.
 * In dev it unregisters previous workers and skips: a cached SW would
 * serve stale bundles and break hot reload.
 * On native (no serviceWorker in navigator) it resolves 'skipped'.
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
