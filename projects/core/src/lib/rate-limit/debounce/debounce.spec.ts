// Run: npx vitest run projects/core/src/lib/rate-limit/debounce/debounce.spec.ts
import { afterEach, describe, expect, it, vi } from 'vitest';

import { debounce } from './debounce';

describe('debounce', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('delays execution until the wait window ends', () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);

    const fn = vi.fn((value: string) => value.toUpperCase());
    const debounced = debounce(fn, 100);

    debounced('hello');

    expect(fn).not.toHaveBeenCalled();
    expect(debounced.pending()).toBe(true);

    vi.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('hello');
    expect(debounced.pending()).toBe(false);
  });

  it('supports leading calls', () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);

    const fn = vi.fn();
    const debounced = debounce(fn, 100, { leading: true, trailing: false });

    debounced('first');

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('first');
    expect(debounced.pending()).toBe(true);
  });

  it('flushes and cancels pending work', () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);

    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced('first');
    expect(debounced.flush()).toBeUndefined();
    expect(fn).toHaveBeenCalledTimes(1);

    debounced('second');
    debounced.cancel();

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(debounced.pending()).toBe(false);
  });

  it('honors maxWait for repeated calls', () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);

    const fn = vi.fn();
    const debounced = debounce(fn, 100, { maxWait: 250 });

    debounced('a');
    vi.advanceTimersByTime(90);
    debounced('b');
    vi.advanceTimersByTime(90);
    debounced('c');
    vi.advanceTimersByTime(80);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('c');
  });
});
