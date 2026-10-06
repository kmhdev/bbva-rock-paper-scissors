import { afterEach, describe, expect, it, vi } from 'vitest';
import { registerServiceWorker } from './pwa';

describe('registerServiceWorker', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('registers /sw.js on production web builds', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const register = vi.fn().mockResolvedValue({});
    vi.stubGlobal('navigator', { serviceWorker: { register } });
    await expect(registerServiceWorker()).resolves.toBe('registered');
    expect(register).toHaveBeenCalledWith('/sw.js');
  });

  it('skips when serviceWorker is unavailable (native)', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubGlobal('navigator', {});
    await expect(registerServiceWorker()).resolves.toBe('skipped');
  });

  it('skips when registration fails', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const register = vi.fn().mockRejectedValue(new Error('denied'));
    vi.stubGlobal('navigator', { serviceWorker: { register } });
    await expect(registerServiceWorker()).resolves.toBe('skipped');
  });

  it('unregisters previous workers and skips in dev', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    const unregister = vi.fn().mockResolvedValue(true);
    const register = vi.fn();
    vi.stubGlobal('navigator', {
      serviceWorker: {
        register,
        getRegistrations: vi.fn().mockResolvedValue([{ unregister }]),
      },
    });
    await expect(registerServiceWorker()).resolves.toBe('skipped');
    expect(register).not.toHaveBeenCalled();
    expect(unregister).toHaveBeenCalled();
  });

  it('skips in dev when getRegistrations is unavailable', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    const register = vi.fn();
    vi.stubGlobal('navigator', { serviceWorker: { register } });
    await expect(registerServiceWorker()).resolves.toBe('skipped');
    expect(register).not.toHaveBeenCalled();
  });
});
