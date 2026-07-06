import { describe, expect, it } from 'vitest';

import { mergeClassNames } from './class-names';

describe('mergeClassNames', () => {
  it('joins class names and removes duplicates', () => {
    expect(mergeClassNames('btn primary', undefined, 'primary active')).toBe('btn primary active');
  });

  it('ignores empty values and extra whitespace', () => {
    expect(mergeClassNames('', '  card   shadow  ', false)).toBe('card shadow');
  });
});
