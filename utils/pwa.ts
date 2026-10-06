export type ServiceWorkerResult = 'registered' | 'skipped';

interface WebNavigator {
  serviceWorker?: { register: (url: string) => Promise<unknown> };
  vibrate?: (pattern: number) => boolean;
}

/**
 * Registers the offline service worker on web only.
 * On native (no serviceWorker in navigator) it resolves 'skipped'.
 */
export async function registerServiceWorker(): Promise<ServiceWorkerResult> {
  try {
    const webNavigator =
      typeof navigator === 'undefined' ? undefined : (navigator as unknown as WebNavigator);
    if (!webNavigator?.serviceWorker) {
      return 'skipped';
    }
    await webNavigator.serviceWorker.register('/sw.js');
    return 'registered';
  } catch {
    return 'skipped';
  }
}
