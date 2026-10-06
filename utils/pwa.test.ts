import { describe, expect, it, vi } from 'vitest';
import { registerServiceWorker } from './pwa';

describe('registerServiceWorker', () => {
  it('registers /sw.js when serviceWorker is available', async () => {
    const register = vi.fn().mockResolvedValue({});
    vi.stubGlobal('navigator', { serviceWorker: { register } });
    await expect(registerServiceWorker()).resolves.toBe('registered');
    expect(register).toHaveBeenCalledWith('/sw.js');
    vi.unstubAllGlobals();
  });

  it('skips when serviceWorker is unavailable (native)', async () => {
    vi.stubGlobal('navigator', {});
    await expect(registerServiceWorker()).resolves.toBe('skipped');
    vi.unstubAllGlobals();
  });

  it('skips when registration fails', async () => {
    const register = vi.fn().mockRejectedValue(new Error('denied'));
    vi.stubGlobal('navigator', { serviceWorker: { register } });
    await expect(registerServiceWorker()).resolves.toBe('skipped');
    vi.unstubAllGlobals();
  });
});
