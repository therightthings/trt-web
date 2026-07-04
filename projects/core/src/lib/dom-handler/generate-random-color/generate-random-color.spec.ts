// Run: npx vitest run projects/core/src/lib/dom-handler/generate-color.spec.ts
import { afterEach, describe, expect, it, vi } from 'vitest';

import { generateRandomColor } from './generate-random-color';

describe('generateColor', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns a lowercase hex color by default', () => {
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0.999);

    expect(generateRandomColor()).toBe('#0080ff');
  });

  it('returns rgb color strings when requested', () => {
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0.999);

    expect(generateRandomColor({ format: 'rgb' })).toBe('rgb(0, 128, 255)');
  });

  it('includes opacity in rgb output when opacity is below 1', () => {
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0.25)
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0.749);

    expect(generateRandomColor({ format: 'rgb', opacity: 0.4 })).toBe('rgba(64, 128, 191, 0.4)');
  });

  it('includes alpha in hex output when opacity is below 1', () => {
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0.999);

    expect(generateRandomColor({ format: 'hex', opacity: 0.5 })).toBe('#0080ff80');
  });
});
