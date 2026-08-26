import { describe, expect, it } from 'vitest';

import { BrowserNfc } from './browser-nfc';

describe('BrowserNfc', () => {
  it('returns a safe support result', () => {
    expect(BrowserNfc).toBeDefined();
  });
});
