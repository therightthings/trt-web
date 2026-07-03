// Run: npx vitest run projects/core/src/lib/array-handler/clean-obj/clean-obj.spec.ts
import { describe, expect, it } from 'vitest';

import { cleanObj } from './clean-obj';

describe('cleanObj', () => {
  it('removes empty top-level and nested values', () => {
    const input = {
      a: undefined,
      b: null,
      c: '',
      d: 0,
      e: false,
      f: {
        g: null,
        h: 'ok',
        i: ['', null, 'keep'],
      },
      j: [null, '', 1, { k: undefined, l: 'x' }],
    };

    expect(cleanObj(input)).toEqual({
      d: 0,
      e: false,
      f: {
        h: 'ok',
        i: ['keep'],
      },
      j: [1, { l: 'x' }],
    });
  });

  it('returns an empty object when everything is cleaned out', () => {
    expect(cleanObj({ a: null, b: undefined, c: '' })).toEqual({});
  });

  it('keeps Date and non-empty primitive values intact', () => {
    const date = new Date('2024-01-01T00:00:00.000Z');

    expect(cleanObj({ date, count: 1, active: true })).toEqual({
      date,
      count: 1,
      active: true,
    });
  });

  it('preserves the prototype of class instances', () => {
    class Person {
      constructor(
        public name: string,
        public nickname: string | null,
      ) {}

      greet() {
        return `hi ${this.name}`;
      }
    }

    const person = new Person('Alice', null);
    const result = cleanObj(person);
    const cleanedPerson = result as Person;

    expect(result).toBeInstanceOf(Person);
    expect(cleanedPerson.greet()).toBe('hi Alice');
    expect(result).toEqual({ name: 'Alice' });
  });

  it('throws on circular references', () => {
    const input: { self?: unknown } = {};
    input.self = input;

    expect(() => cleanObj(input)).toThrow('Circular reference detected');
  });
});
