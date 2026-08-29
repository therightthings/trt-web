// Run: npx vitest run projects/core/src/lib/browser/vibration/browser-vibration.spec.ts
import { afterEach, describe, expect, it, vi } from 'vitest';

import { BrowserVibration } from './browser-vibration';

const stubBrowserShell = (vibrate?: ReturnType<typeof vi.fn>) => {
  const navigator = {
    vibrate: vibrate ?? vi.fn(() => true),
  };

  vi.stubGlobal('navigator', navigator);
  vi.stubGlobal('window', { document: {} });
  vi.stubGlobal('document', {});

  return navigator;
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('BrowserVibration', () => {
  it('reports support when navigator.vibrate exists', () => {
    stubBrowserShell();

    expect(BrowserVibration.isSupported()).toBe(true);
  });

  it('reports unsupported when navigator.vibrate does not exist', () => {
    vi.stubGlobal('navigator', {});
    vi.stubGlobal('window', { document: {} });
    vi.stubGlobal('document', {});

    expect(BrowserVibration.isSupported()).toBe(false);
  });

  it('passes a numeric pattern to navigator.vibrate', () => {
    const vibrate = vi.fn(() => true);
    stubBrowserShell(vibrate);

    expect(BrowserVibration.vibrate(200)).toBe(true);
    expect(vibrate).toHaveBeenCalledWith(200);
  });

  it('passes an array pattern to navigator.vibrate', () => {
    const vibrate = vi.fn(() => true);
    stubBrowserShell(vibrate);
    const pattern = [200, 100, 200];

    expect(BrowserVibration.vibrate(pattern)).toBe(true);
    expect(vibrate).toHaveBeenCalledWith(pattern);
  });

  it('returns false when vibration is unsupported', () => {
    vi.stubGlobal('navigator', {});
    vi.stubGlobal('window', { document: {} });
    vi.stubGlobal('document', {});

    expect(BrowserVibration.vibrate(200)).toBe(false);
  });

  it('returns the browser result when vibration is rejected', () => {
    const vibrate = vi.fn(() => false);
    stubBrowserShell(vibrate);

    expect(BrowserVibration.vibrate(200)).toBe(false);
  });

  it('returns false when navigator.vibrate throws', () => {
    const vibrate = vi.fn(() => {
      throw new Error('Vibration failed');
    });
    stubBrowserShell(vibrate);

    expect(BrowserVibration.vibrate(200)).toBe(false);
  });

  it('cancels the active vibration with a zero pattern', () => {
    const vibrate = vi.fn(() => true);
    stubBrowserShell(vibrate);

    expect(BrowserVibration.cancel()).toBe(true);
    expect(vibrate).toHaveBeenCalledWith(0);
  });
});
