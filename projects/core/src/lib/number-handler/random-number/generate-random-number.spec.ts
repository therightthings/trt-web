/**
 * npx vitest run projects/core/src/lib/number-handler/generate-random-number.spec.ts
 */
import { afterEach, describe, expect, it, vi } from 'vitest';

import { generateRandomNumber } from './generate-random-number';

describe('generateRandomNumber', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns an integer within the inclusive range', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);

    expect(generateRandomNumber({ min: 1, max: 3 })).toBe(2);
  });

  it('swaps min and max when they are reversed', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);

    expect(generateRandomNumber({ min: 10, max: 7 })).toBe(7);
  });

  it('returns a decimal number when decimal mode is enabled', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.123456);

    expect(
      generateRandomNumber({
        min: 1,
        max: 2,
        decimal: true,
        decimalPlaces: 3,
      }),
    ).toBe(1.123);
  });

  it('rejects non-integer inputs when decimal mode is off', () => {
    expect(() => generateRandomNumber({ min: 1.2, max: 3 })).toThrow(
      'min and max must be integers',
    );
  });

  it('rejects non-finite inputs', () => {
    expect(() => generateRandomNumber({ min: Number.NEGATIVE_INFINITY, max: 3 })).toThrow(
      'min and max must be finite numbers',
    );
  });

  it('rejects invalid decimal precision', () => {
    expect(() =>
      generateRandomNumber({
        min: 1,
        max: 2,
        decimal: true,
        decimalPlaces: -1,
      }),
    ).toThrow('decimalPlaces must be a non-negative integer');
  });
});
