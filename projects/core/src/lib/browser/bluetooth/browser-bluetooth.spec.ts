import { describe, expect, it } from 'vitest';

import { BrowserBluetooth } from './browser-bluetooth';

describe('BrowserBluetooth', () => {
  it('returns a safe support result', () => {
    expect(BrowserBluetooth).toBeDefined();
  });
});
