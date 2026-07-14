// Run: npx vitest run projects/core/src/lib/file-handler/convert-file-size/convert-file-size.spec.ts
import { describe, expect, it } from 'vitest';

import { convertFileSize } from './convert-file-size';

describe('convertFileSize', () => {
  it('converts byte to kb', () => {
    expect(convertFileSize(1024, `byte:kb`)).toBe(1);
  });

  it('converts gb to mb', () => {
    expect(convertFileSize(2, `Gb:Mb`)).toBe(2048);
  });

  it('converts mb to byte', () => {
    expect(convertFileSize(1.5, `Mb:byte`)).toBe(1572864);
  });

  it('rounds to the configured decimal places', () => {
    expect(convertFileSize(1, `Mb:Gb`, { decimalPlaces: 4 })).toBe(0.001);
  });

  it('throws when decimalPlaces is invalid', () => {
    expect(() => convertFileSize(1, `Mb:Gb`, { decimalPlaces: -1 })).toThrow(
      'decimalPlaces must be a non-negative integer',
    );
  });

  it('throws when value is not finite', () => {
    expect(() => convertFileSize(Number.POSITIVE_INFINITY, `byte:kb`)).toThrow(
      'value must be a finite number',
    );
  });
});
