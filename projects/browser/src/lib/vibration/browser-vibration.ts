import { requireBrowserEnv } from '@trt-web/core';

import type { BrowserVibratePattern } from './browser-vibration.type';

/**
 * Device vibration helpers.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API
 */
export class BrowserVibration {
  static isSupported(): boolean {
    requireBrowserEnv();

    return 'vibrate' in navigator;
  }

  static vibrate(pattern: BrowserVibratePattern): boolean {
    if (!this.isSupported()) {
      return false;
    }

    try {
      return navigator.vibrate(pattern);
    } catch {
      return false;
    }
  }

  static cancel(): boolean {
    return this.vibrate(0);
  }
}
