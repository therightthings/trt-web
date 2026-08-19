import { describe, expect, it } from 'vitest';

import { BrowserTheme } from './browser-theme';

describe('BrowserTheme', () => {
  it('requires a browser environment for support checks', () => {
    expect(() => BrowserTheme.isSupported()).toThrow(
      'This function can only be used in a browser environment.',
    );
  });

  it('requires a browser environment to read the system theme', () => {
    expect(() => BrowserTheme.getSystemTheme()).toThrow(
      'This function can only be used in a browser environment.',
    );
  });

  it('requires a browser environment to subscribe', () => {
    expect(() => BrowserTheme.subscribe(() => undefined)).toThrow(
      'This function can only be used in a browser environment.',
    );
  });
});
