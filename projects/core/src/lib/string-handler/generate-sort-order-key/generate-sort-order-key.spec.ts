// Run: npx vitest run projects/core/src/lib/string-handler/generate-sort-order-key/generate-sort-order-key.spec.ts
import { describe, expect, it } from 'vitest';

import { generateSortOrderKey } from './generate-sort-order-key';
import { SORT_ORDER_KEY_CONFIG } from './generate-sort-order-key.type';

const { length: LENGTH } = SORT_ORDER_KEY_CONFIG;
const VALID_KEY_PATTERN = new RegExp(`^[0-9A-Za-z]{${LENGTH}}$`);

describe('generateSortOrderKey', () => {
  it('generates a fixed-width default key', () => {
    const key = generateSortOrderKey();

    expect(key).toMatch(VALID_KEY_PATTERN);
    expect(key).toHaveLength(LENGTH);
  });

  it('generates a key between previous and next', () => {
    const previous = '0'.repeat(LENGTH);
    const next = 'z'.repeat(LENGTH);
    const key = generateSortOrderKey({ previous, next });

    expect(key).toMatch(VALID_KEY_PATTERN);
    expect(previous < key).toBe(true);
    expect(key < next).toBe(true);
  });

  it('generates a key after previous when next is omitted', () => {
    const previous = 'U'.padEnd(LENGTH, '0');
    const key = generateSortOrderKey({ previous });

    expect(key).toMatch(VALID_KEY_PATTERN);
    expect(previous < key).toBe(true);
    expect(key < 'z'.repeat(LENGTH)).toBe(true);
  });

  it('generates a key before next when previous is omitted', () => {
    const next = 'U'.padEnd(LENGTH, '0');
    const key = generateSortOrderKey({ next });

    expect(key).toMatch(VALID_KEY_PATTERN);
    expect('0'.repeat(LENGTH) < key).toBe(true);
    expect(key < next).toBe(true);
  });

  it('throws when previous is not smaller than next', () => {
    expect(() =>
      generateSortOrderKey({
        previous: 'U'.padEnd(LENGTH, '0'),
        next: 'U'.padEnd(LENGTH, '0'),
      }),
    ).toThrow('Previous rank must be smaller than next rank');
  });

  it('throws on unsupported characters', () => {
    expect(() => generateSortOrderKey({ previous: 'abc$', next: 'abcd' })).toThrow(
      'previous contains unsupported character: "$"',
    );
  });

  it('throws when there is no room before minimum or after maximum', () => {
    expect(() => generateSortOrderKey({ next: '0'.repeat(LENGTH) })).toThrow(
      'Cannot generate rank before the minimum rank',
    );
    expect(() => generateSortOrderKey({ previous: 'z'.repeat(LENGTH) })).toThrow(
      'Cannot generate rank after the maximum rank',
    );
  });

  it('throws when no middle rank is available', () => {
    const previous = '0'.repeat(LENGTH);
    const next = '0'.repeat(LENGTH - 1) + '1';

    expect(() =>
      generateSortOrderKey({
        previous,
        next,
      }),
    ).toThrow('No available rank between previous and next');
  });
});
