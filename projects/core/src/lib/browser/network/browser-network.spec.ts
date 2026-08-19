import { describe, expect, it } from 'vitest';

import { BrowserNetwork } from './browser-network';

describe('BrowserNetwork', () => {
  it('requires a browser environment for support checks', () => {
    expect(() => BrowserNetwork.isSupported()).toThrow(
      'This function can only be used in a browser environment.',
    );
  });

  it('requires a browser environment to read the network state', () => {
    expect(() => BrowserNetwork.getState()).toThrow(
      'This function can only be used in a browser environment.',
    );
  });

  it('requires a browser environment to subscribe', () => {
    expect(() => BrowserNetwork.subscribe(() => undefined)).toThrow(
      'This function can only be used in a browser environment.',
    );
  });

  it('can clear subscriptions safely when none are registered', () => {
    expect(() => BrowserNetwork.unsubscribe()).not.toThrow();
  });
});
