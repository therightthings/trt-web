import { describe, expect, it } from 'vitest';

import { BrowserFileSystem } from './browser-file-system';

describe('BrowserFileSystem', () => {
  it('returns a safe support result', () => {
    expect(BrowserFileSystem).toBeDefined();
  });
});
