import { isType, requireBrowserEnv } from '../../utils';
import { AbstractBrowserUtils } from '../abstract-browser';

/**
 * Keep the screen awake while an active task is running.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API
 */
export class BrowserWakeLock extends AbstractBrowserUtils {
  private static sentinel?: WakeLockSentinel;
  private static enabled = false;
  private static listening = false;
  private static readonly onVisibilityChange = (): void => {
    if (!this.enabled) {
      return;
    }

    if (document.visibilityState === 'visible') {
      void this.acquire();
      return;
    }

    void this.release();
  };

  static override isSupported(): boolean {
    requireBrowserEnv();
    return isType('object', navigator, 'wakeLock');
  }

  private static get wakeLock(): WakeLock | undefined {
    return this.isSupported() ? navigator.wakeLock : undefined;
  }

  static isActive(): boolean {
    return Boolean(this.sentinel);
  }

  static async enable(): Promise<boolean> {
    if (!this.wakeLock) {
      return false;
    }

    this.enabled = true;
    if (!this.listening) {
      document.addEventListener('visibilitychange', this.onVisibilityChange);
      this.listening = true;
    }

    return this.acquire();
  }

  static async disable(): Promise<void> {
    this.enabled = false;
    if (this.listening) {
      document.removeEventListener('visibilitychange', this.onVisibilityChange);
      this.listening = false;
    }

    await this.release();
  }

  private static async acquire(): Promise<boolean> {
    const wakeLock = this.wakeLock;
    if (!wakeLock) {
      return false;
    }

    if (this.sentinel) {
      return true;
    }

    try {
      this.sentinel = await wakeLock.request('screen');
      this.sentinel.addEventListener('release', () => {
        this.sentinel = undefined;
      });
      return true;
    } catch {
      return false;
    }
  }

  private static async release(): Promise<void> {
    if (!this.sentinel) {
      return;
    }

    try {
      await this.sentinel.release();
    } finally {
      this.sentinel = undefined;
    }
  }
}
