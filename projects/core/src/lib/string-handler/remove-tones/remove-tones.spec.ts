// Run: npx vitest run projects/core/src/lib/string-handler/remove-tones/remove-tones.spec.ts
import { describe, expect, it } from 'vitest';

import { removeTones } from './remove-tones';

describe('removeTones', () => {
  it('keeps the existing Vietnamese behavior', () => {
    expect(removeTones('Đắk Lắk', { separator: '_' })).toBe('dak_lak');
  });

  it('folds accents from common Latin-based languages', () => {
    expect(removeTones('Crème brûlée')).toBe('creme brulee');
    expect(removeTones('São Tomé e Príncipe')).toBe('sao tome e principe');
    expect(removeTones('İstanbul')).toBe('istanbul');
  });

  it('handles letters that do not decompose with simple NFD', () => {
    expect(removeTones('Straße')).toBe('strasse');
    expect(removeTones('Ærøskøbing')).toBe('aeroskobing');
    expect(removeTones('Łódź')).toBe('lodz');
  });

  it('removes non-Latin and non-ASCII characters by default', () => {
    expect(removeTones('中文 Café 😀')).toBe('cafe');
  });

  it('keeps non-Latin letters when disabled but still strips unsupported symbols', () => {
    expect(
      removeTones('中文 Café 😀', {
        removeNonLatinAscii: false,
      }),
    ).toBe('中文 cafe');
  });

  it('uses the provided separator', () => {
    expect(removeTones('Crème brûlée', { separator: '|' })).toBe('creme|brulee');
  });
});
