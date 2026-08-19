import { describe, expect, it } from 'vitest';

import { BrowserPeerConnection } from './browser-peer-connection';

describe('BrowserPeerConnection', () => {
  it('requires a browser environment for support checks', () => {
    expect(() => BrowserPeerConnection.isSupported()).toThrow(
      'This function can only be used in a browser environment.',
    );
  });

  it('reports a disconnected state before initialization', () => {
    expect(BrowserPeerConnection.isConnected()).toBe(false);
  });

  it('closes safely when no connection exists', () => {
    expect(() => BrowserPeerConnection.close()).not.toThrow();
  });

  it('returns safe results when no connection is initialized', async () => {
    expect(BrowserPeerConnection.createDataChannel({ label: 'demo' })).toBeUndefined();
    expect(await BrowserPeerConnection.createOffer()).toBeUndefined();
    expect(await BrowserPeerConnection.createAnswer()).toBeUndefined();
    expect(await BrowserPeerConnection.setLocalDescription()).toBe(false);
    expect(await BrowserPeerConnection.setRemoteDescription({ type: 'offer' })).toBe(false);
    expect(await BrowserPeerConnection.addIceCandidate(null)).toBe(false);
    expect(await BrowserPeerConnection.getStats()).toBeUndefined();
    expect(BrowserPeerConnection.restartIce()).toBe(false);
  });
});
