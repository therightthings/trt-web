// Run: npx vitest run projects/core/src/lib/browser/viewport/browser-viewport.spec.ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BrowserViewport } from './browser-viewport';

describe('BrowserViewport', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {
      addEventListener: vi.fn(),
      innerHeight: 900,
      innerWidth: 1440,
      removeEventListener: vi.fn(),
    });
    vi.stubGlobal('document', {});
    BrowserViewport.register({
      mobile: { max: 767 },
      tablet: { min: 768, max: 1023 },
      desktop: { min: 1024 },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns the current size and default desktop range', () => {
    expect(BrowserViewport.getCurrentState()).toEqual({
      width: 1440,
      height: 900,
      ranges: ['desktop'],
      orientation: 'landscape',
    });
    expect(BrowserViewport.isInRange('desktop')).toBe(true);
  });

  it('matches multiple custom ranges', () => {
    BrowserViewport.register({
      desktop: { min: 1024 },
      wide: { min: 1440 },
    });

    expect(BrowserViewport.getCurrentState()).toEqual({
      height: 900,
      ranges: ['desktop', 'wide'],
      width: 1440,
      orientation: 'landscape',
    });
  });

  it('notifies independent subscriptions only for matching ranges', () => {
    const allHandler = vi.fn();
    const wideHandler = vi.fn();
    const allSubscription = BrowserViewport.subscribe(allHandler);
    const wideSubscription = BrowserViewport.subscribe(wideHandler, { range: 'wide' });

    const resizeHandler = vi.mocked(window.addEventListener).mock.calls[0]?.[1] as EventListener;
    resizeHandler(new Event('resize'));
    expect(allHandler).toHaveBeenCalledTimes(1);
    expect(wideHandler).not.toHaveBeenCalled();

    BrowserViewport.register({ wide: { min: 1024 } });
    expect(allHandler).toHaveBeenCalledTimes(2);
    expect(wideHandler).toHaveBeenCalledTimes(1);

    allSubscription.unsubscribe();
    wideSubscription.unsubscribe();
    expect(window.removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
  });

  it('emits the updated orientation after a resize', () => {
    const handler = vi.fn();
    const subscription = BrowserViewport.subscribe(handler);
    const resizeHandler = vi.mocked(window.addEventListener).mock.calls[0]?.[1] as EventListener;

    window.innerWidth = 600;
    window.innerHeight = 900;
    resizeHandler(new Event('resize'));

    expect(handler).toHaveBeenCalledWith({
      width: 600,
      height: 900,
      orientation: 'portrait',
      ranges: ['mobile'],
    });

    subscription.unsubscribe();
  });

  it('rejects invalid ranges', () => {
    expect(() => BrowserViewport.register({})).toThrow();
    expect(() => BrowserViewport.register({ invalid: { min: 800, max: 600 } })).toThrow();
    expect(() => BrowserViewport.register({ invalid: { min: -1 } })).toThrow();
  });
});
