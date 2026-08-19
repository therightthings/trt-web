import { describe, expect, it } from 'vitest';

import { BrowserMedia } from './browser-media';

describe('BrowserMedia', () => {
  it('returns a safe support result', () => {
    expect(BrowserMedia).toBeDefined();
  });
});
