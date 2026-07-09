// Run: npx vitest run projects/core/src/lib/number-handler/format-view-count/format-view-count.spec.ts
import { describe, expect, it } from 'vitest';

import { formatViewCount } from './format-view-count';

describe('formatViewCount', () => {
  it('returns the original number when it is below 1000', () => {
    expect(formatViewCount(0)).toBe('0');
    expect(formatViewCount(999)).toBe('999');
  });

  it('formats thousands with one decimal place when needed', () => {
    expect(formatViewCount(1000)).toBe('1k');
    expect(formatViewCount(1200)).toBe('1.2k');
    expect(formatViewCount(1999)).toBe('2k');
  });

  it('respects custom decimal places', () => {
    expect(formatViewCount(1250, { decimalPlaces: 2 })).toBe('1.25k');
    expect(formatViewCount(1250, { decimalPlaces: 0 })).toBe('1k');
  });

  it('falls back to one decimal place when decimalPlaces is negative', () => {
    expect(formatViewCount(1250, { decimalPlaces: -1 })).toBe('1.3k');
  });

  it('supports uppercase suffixes', () => {
    expect(formatViewCount(1200, { uppercase: true })).toBe('1.2K');
    expect(formatViewCount(2_500_000, { uppercase: true })).toBe('2.5M');
  });

  it('formats millions and billions with the correct suffix', () => {
    expect(formatViewCount(1_250_000)).toBe('1.3m');
    expect(formatViewCount(2_500_000_000)).toBe('2.5b');
  });

  it('keeps the fallback behavior when decimalPlaces is omitted', () => {
    expect(formatViewCount(1200)).toBe('1.2k');
  });
});
