import { describe, expect, it } from 'vitest';

import { BrowserTabActivity } from './browser-tab-activity';

describe('BrowserTabActivity', () => {
  it('requires a browser environment for support checks', () => {
    expect(() => BrowserTabActivity.isSupported()).toThrow(
      'This function can only be used in a browser environment.',
    );
  });

  it('requires a browser environment to read the tab state', () => {
    expect(() => BrowserTabActivity.getState()).toThrow(
      'This function can only be used in a browser environment.',
    );
  });

  it('requires a browser environment to subscribe', () => {
    expect(() => BrowserTabActivity.subscribe(() => undefined)).toThrow(
      'This function can only be used in a browser environment.',
    );
  });

  it('can clear subscriptions safely when none are registered', () => {
    expect(() => BrowserTabActivity.unsubscribe()).not.toThrow();
  });
});
