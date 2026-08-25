import { afterEach, describe, expect, it, vi } from 'vitest';

import { BrowserPeerConnection } from './browser-peer-connection';

describe('BrowserPeerConnection', () => {
  afterEach(() => {
    BrowserPeerConnection.close();
    vi.unstubAllGlobals();
  });

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

  it('exposes the currently managed connection and clears it after close', () => {
    class PeerConnectionMock {
      connectionState = 'new';
      addEventListener = vi.fn();
      removeEventListener = vi.fn();
      close = vi.fn();
    }

    vi.stubGlobal('document', {});
    vi.stubGlobal('window', {
      isSecureContext: true,
      RTCPeerConnection: PeerConnectionMock,
    });

    expect(BrowserPeerConnection.getPeerConnection()).toBeUndefined();

    const connection = BrowserPeerConnection.createPeerConnection();

    expect(BrowserPeerConnection.getPeerConnection()).toBe(connection);

    BrowserPeerConnection.close();

    expect(BrowserPeerConnection.getPeerConnection()).toBeUndefined();
    expect(connection?.close).toHaveBeenCalledOnce();
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
