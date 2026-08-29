import { describe, expect, it } from 'vitest';

import { BrowserWakeLock } from './browser-wake-lock';

describe('BrowserWakeLock', () => {
  it('requires a browser environment for support checks', () => {
    expect(() => BrowserWakeLock.isSupported()).toThrow(
      'This function can only be used in a browser environment.',
    );
  });

  it('returns inactive before enabling wake lock', () => {
    expect(BrowserWakeLock.isActive()).toBe(false);
  });

  it('can disable safely when wake lock is not active', async () => {
    await expect(BrowserWakeLock.disable()).resolves.toBeUndefined();
    expect(BrowserWakeLock.isActive()).toBe(false);
  });
});
