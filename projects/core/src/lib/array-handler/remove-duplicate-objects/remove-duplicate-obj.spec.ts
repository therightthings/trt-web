/**
 * npx vitest run projects/core/src/lib/array-handler/remove-duplicate-obj.spec.ts
 */
import { describe, expect, it } from 'vitest';

import { removeDuplicateObjects } from './remove-duplicate-obj';

describe('removeDuplicateObjects', () => {
  it('keeps the first item for duplicate plain objects', () => {
    const first = { id: 1, name: 'A' };
    const second = { id: 1, name: 'A' };
    const third = { id: 2, name: 'B' };

    const result = removeDuplicateObjects([first, second, third]);

    expect(result).toEqual([first, third]);
    expect(result[0]).toBe(first);
  });

  it('keeps prototype and methods on class instances', () => {
    class Person {
      constructor(
        public id: number,
        public name: string,
      ) {}

      greet() {
        return `hi ${this.name}`;
      }
    }

    const first = new Person(1, 'Alice');
    const second = new Person(1, 'Alice');

    const result = removeDuplicateObjects([first, second]);

    expect(result).toHaveLength(1);
    expect(result[0]).toBe(first);
    expect(result[0]).toBeInstanceOf(Person);
    expect(result[0].greet()).toBe('hi Alice');
  });

  it('deduplicates by filter key when provided', () => {
    const result = removeDuplicateObjects(
      [
        { id: 1, name: 'A' },
        { id: 1, name: 'B' },
        { id: 2, name: 'C' },
      ],
      (item) => String(item.id),
    );

    expect(result).toEqual([
      { id: 1, name: 'A' },
      { id: 2, name: 'C' },
    ]);
  });

  it('keeps Date values intact', () => {
    const date = new Date('2024-01-01T00:00:00.000Z');
    const result = removeDuplicateObjects([date, new Date('2024-01-01T00:00:00.000Z')]);

    expect(result).toHaveLength(1);
    expect(result[0]).toBe(date);
    expect(result[0]).toBeInstanceOf(Date);
  });

  it('deduplicates Map values without losing the instance', () => {
    const first = new Map([
      ['b', 2],
      ['a', 1],
    ]);
    const second = new Map([
      ['a', 1],
      ['b', 2],
    ]);

    const result = removeDuplicateObjects([first, second]);

    expect(result).toHaveLength(1);
    expect(result[0]).toBe(first);
    expect(result[0]).toBeInstanceOf(Map);
    expect(Array.from(result[0].entries())).toEqual([
      ['b', 2],
      ['a', 1],
    ]);
  });

  it('deduplicates Set values without losing the instance', () => {
    const first = new Set([3, 1, 2]);
    const second = new Set([2, 1, 3]);

    const result = removeDuplicateObjects([first, second]);

    expect(result).toHaveLength(1);
    expect(result[0]).toBe(first);
    expect(result[0]).toBeInstanceOf(Set);
    expect(Array.from(result[0].values())).toEqual([3, 1, 2]);
  });

  it('keeps undefined and bigint values intact', () => {
    const result = removeDuplicateObjects([undefined, undefined, 1n, 1n]);

    expect(result).toEqual([undefined, 1n]);
  });

  it('treats distinct symbols as distinct values', () => {
    const one = Symbol('token');
    const two = Symbol('token');

    const result = removeDuplicateObjects([one, one, two]);

    expect(result).toEqual([one, two]);
  });
});
