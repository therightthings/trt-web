// Run: npx vitest run projects/core/src/lib/string-handler/search-key/generate-search-key.spec.ts
import { describe, expect, it } from 'vitest';

import { generateSearchKeys } from './generate-search-key';

describe('buildSearchKeys', () => {
  it('builds normalized prefixes, phrase prefixes, and acronym by default', () => {
    expect(generateSearchKeys('Đắk Lắk')).toEqual([
      'da',
      'dak',
      'dak ',
      'dak l',
      'dak la',
      'dak lak',
      'dl',
      'la',
      'lak',
    ]);
  });

  it('removes non-Latin input by default', () => {
    expect(generateSearchKeys('中文 😀')).toEqual([]);
  });

  it('respects minPrefixLength', () => {
    expect(
      generateSearchKeys('Café', {
        minPrefixLength: 1,
        includePhrasePrefixes: false,
        includeAcronym: false,
      }),
    ).toEqual(['c', 'ca', 'caf', 'cafe']);
  });

  it('respects maxPrefixLength', () => {
    expect(
      generateSearchKeys('Café', {
        minPrefixLength: 1,
        maxPrefixLength: 2,
        includePhrasePrefixes: false,
        includeAcronym: false,
      }),
    ).toEqual(['c', 'ca', 'cafe']);
  });

  it('can disable phrase prefixes', () => {
    expect(
      generateSearchKeys('Đắk Lắk', {
        includePhrasePrefixes: false,
      }),
    ).toEqual(['da', 'dak', 'dak lak', 'dl', 'la', 'lak']);
  });

  it('can disable acronym generation', () => {
    expect(
      generateSearchKeys('Đắk Lắk', {
        includeAcronym: false,
      }),
    ).toEqual(['da', 'dak', 'dak ', 'dak l', 'dak la', 'dak lak', 'la', 'lak']);
  });
});
