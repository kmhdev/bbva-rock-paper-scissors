import { afterEach, describe, expect, it, vi } from 'vitest';
import { vibrateOnLoss } from './vibration';

describe('vibrateOnLoss', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('uses navigator.vibrate on web when available', async () => {
    const vibrate = vi.fn().mockReturnValue(true);
    vi.stubGlobal('navigator', { vibrate });
    await expect(vibrateOnLoss()).resolves.toBe('web');
    expect(vibrate).toHaveBeenCalledWith(200);
  });

  it('returns none when no vibration API exists and haptics is unavailable', async () => {
    vi.stubGlobal('navigator', {});
    await expect(vibrateOnLoss()).resolves.toBe('none');
  });

  it('returns none when navigator.vibrate throws', async () => {
    const vibrate = vi.fn().mockImplementation(() => {
      throw new Error('nope');
    });
    vi.stubGlobal('navigator', { vibrate });
    await expect(vibrateOnLoss()).resolves.toBe('none');
  });
});
