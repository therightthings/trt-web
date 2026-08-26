// Run: npx vitest run projects/core/src/lib/browser/window-manager/browser-window-manager.spec.ts

import { describe, expect, it } from 'vitest';

import { BrowserWindowManager } from './browser-window-manager';

describe('BrowserWindowManager', () => {
  it('requires a browser environment', () => {
    expect(() => BrowserWindowManager.open()).toThrow(
      'This function can only be used in a browser environment.',
    );
  });
});
