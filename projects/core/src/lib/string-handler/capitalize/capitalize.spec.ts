// Run: npx vitest run projects/core/src/lib/string-handler/capitalize/capitalize.spec.ts
import { describe, expect, it } from 'vitest';

import { capitalize } from './capitalize';

describe('capitalize', () => {
  it('capitalizes the first character by default for strings', () => {
    expect(capitalize('hello world')).toBe('Hello world');
  });

  it('supports first and words modes for strings', () => {
    expect(capitalize('hello world', { mode: 'first' })).toBe('Hello world');
    expect(capitalize('hello world', { mode: 'words' })).toBe('Hello World');
  });

  it('returns an empty string for empty string input', () => {
    expect(capitalize('')).toBe('');
    expect(capitalize('   ', { mode: 'words' })).toBe('');
  });

  it('returns a copied object when no fields are configured', () => {
    const data = { title: 'hello', count: 1 };
    const result = capitalize(data);

    expect(result).toEqual(data);
    expect(result).not.toBe(data);
  });

  it('capitalizes configured first fields', () => {
    expect(
      capitalize(
        { firstName: 'alice', lastName: 'nguyen van an', age: 30 },
        { first: ['firstName'] },
      ),
    ).toEqual({ firstName: 'Alice', lastName: 'nguyen van an', age: 30 });
  });

  it('capitalizes configured words fields', () => {
    expect(
      capitalize({ firstName: 'alice', lastName: 'nguyen van an' }, { words: ['lastName'] }),
    ).toEqual({ firstName: 'alice', lastName: 'Nguyen Van An' });
  });

  it('supports first and words fields together', () => {
    expect(
      capitalize(
        { title: 'hello world', author: 'alice nguyen', summary: '' },
        { first: ['title'], words: ['author'] },
      ),
    ).toEqual({ title: 'Hello world', author: 'Alice Nguyen', summary: '' });
  });

  it('converts null string fields to empty strings', () => {
    expect(capitalize({ title: null }, { first: ['title'] })).toEqual({ title: '' });
  });
});
