import { describe, expect, it } from 'vitest';

import { BrowserCamera } from './browser-camera';

describe('BrowserCamera', () => {
  it('requires a browser environment for support checks', () => {
    expect(() => BrowserCamera.isSupported()).toThrow(
      'This function can only be used in a browser environment.',
    );
  });

  it('rejects facing-mode checks outside a browser environment', async () => {
    await expect(BrowserCamera.facingModes()).rejects.toThrow(
      'This function can only be used in a browser environment.',
    );
  });

  it('returns false when no camera stream is active', () => {
    expect(BrowserCamera.turnOff()).toBe(false);
    expect(BrowserCamera.isStreamActive).toBe(false);
  });
});
