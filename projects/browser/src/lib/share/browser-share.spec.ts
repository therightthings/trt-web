// Run: npx vitest run projects/core/src/lib/browser/share/browser-share.spec.ts
import { afterEach, describe, expect, it, vi } from 'vitest';

import { BrowserShare } from './browser-share';

function stubBrowserShell(overrides?: {
  navigator?: Record<string, unknown>;
  window?: Record<string, unknown>;
}) {
  const share =
    (overrides?.navigator?.['share'] as ReturnType<typeof vi.fn> | undefined) ?? vi.fn();
  const canShare =
    (overrides?.navigator?.['canShare'] as ReturnType<typeof vi.fn> | undefined) ??
    vi.fn(() => true);

  const navigator = {
    share,
    canShare,
    ...overrides?.navigator,
  } as Record<string, unknown>;

  const window = {
    document: {},
    ...overrides?.window,
  } as Record<string, unknown>;

  vi.stubGlobal('navigator', navigator);
  vi.stubGlobal('window', window);
  vi.stubGlobal('document', {});

  return {
    share,
    canShare,
    navigator,
    window,
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('BrowserShare', () => {
  it('returns denied when the payload cannot be shared', async () => {
    const { canShare, share } = stubBrowserShell({
      navigator: {
        canShare: vi.fn(() => false),
      },
    });

    await expect(BrowserShare.share({ text: 'hello' })).resolves.toEqual({
      permission: 'denied',
      success: false,
    });
    expect(canShare).toHaveBeenCalledWith({ text: 'hello' });
    expect(share).not.toHaveBeenCalled();
  });

  it('awaits the share promise before resolving', async () => {
    const { share } = stubBrowserShell();
    let resolveShare: (() => void) | undefined;
    const sharePromise = new Promise<void>((resolve) => {
      resolveShare = resolve;
    });
    share.mockReturnValueOnce(sharePromise);

    const resultPromise = BrowserShare.share({ text: 'hello' });
    let settled = false;
    resultPromise.then(() => {
      settled = true;
    });

    await Promise.resolve();
    expect(settled).toBe(false);

    resolveShare?.();

    await expect(resultPromise).resolves.toEqual({
      permission: 'granted',
      data: { text: 'hello' },
      success: true,
    });
    expect(share).toHaveBeenCalledWith({ text: 'hello' });
  });

  it('returns false when navigator.share rejects', async () => {
    const { share } = stubBrowserShell();
    share.mockRejectedValueOnce(new Error('cancelled'));

    await expect(BrowserShare.share({ text: 'hello' })).resolves.toEqual({
      permission: 'granted',
      success: false,
    });
  });
});
