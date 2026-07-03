// Run: npx vitest run projects/core/src/lib/rate-limit/throttle/throttle.spec.ts
import { afterEach, describe, expect, it, vi } from 'vitest';

import { throttle } from './throttle';

describe('throttle', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('invokes immediately and once more on the trailing edge', () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);

    const fn = vi.fn();
    const throttled = throttle(fn, 100);

    throttled('a');
    throttled('b');

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('a');
    expect(throttled.pending()).toBe(true);

    vi.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith('b');
    expect(throttled.pending()).toBe(false);
  });

  it('supports trailing-only throttling', () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);

    const fn = vi.fn();
    const throttled = throttle(fn, 100, { leading: false, trailing: true });

    throttled('a');

    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('a');
  });

  it('flushes and cancels pending work', () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);

    const fn = vi.fn();
    const throttled = throttle(fn, 100);

    throttled('a');
    throttled('b');

    expect(throttled.flush()).toBeUndefined();
    expect(fn).toHaveBeenCalledTimes(2);

    throttled('c');
    throttled.cancel();

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
