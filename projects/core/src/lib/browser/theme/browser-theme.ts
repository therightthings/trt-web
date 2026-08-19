import type { BrowserSubscription } from '../../utils';
import { isType, requireBrowserEnv } from '../../utils';
import { AbstractBrowserUtils } from '../abstract-browser';
import type { BrowserThemeMode } from './browser-theme.type';

/**
 * Observe the system color scheme.
 *
 * @example
 * ```ts
 * const subscription = BrowserTheme.subscribe((theme) => {
 *   console.log(theme);
 * });
 *
 * subscription.unsubscribe();
 * ```
 */
export class BrowserTheme extends AbstractBrowserUtils {
  static override isSupported(): boolean {
    requireBrowserEnv();
    return isType('function', window, 'matchMedia');
  }

  private static get media(): MediaQueryList | undefined {
    if (!this.isSupported()) {
      return undefined;
    }

    return window.matchMedia('(prefers-color-scheme: dark)');
  }

  static getSystemTheme(): Exclude<BrowserThemeMode, 'system'> {
    return this.media?.matches ? 'dark' : 'light';
  }

  static subscribe(
    handler: (theme: Exclude<BrowserThemeMode, 'system'>) => void,
  ): BrowserSubscription {
    const media = this.media;
    if (!media) {
      return { unsubscribe: () => undefined };
    }

    const onSystemThemeChange = (): void => {
      handler(this.getSystemTheme());
    };

    media.addEventListener('change', onSystemThemeChange);

    const unsubscribe = (): void => {
      media.removeEventListener('change', onSystemThemeChange);
    };

    return { unsubscribe };
  }
}
