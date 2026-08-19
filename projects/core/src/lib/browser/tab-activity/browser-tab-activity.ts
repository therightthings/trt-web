import type { BrowserSubscription } from '../../utils';
import { requireBrowserEnv } from '../../utils';
import { AbstractBrowserUtils } from '../abstract-browser';
import type { BrowserTabActivityState } from './browser-tab-activity.type';

/**
 * Track browser focus, blur and document visibility changes.
 *
 * @example
 * ```ts
 * const subscription = BrowserTabActivity.subscribe((state) => {
 *   console.log(state);
 * });
 *
 * subscription.unsubscribe();
 * ```
 *
 * Browser tab visibility and focus activity helpers.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/blur_event
 */
export class BrowserTabActivity extends AbstractBrowserUtils {
  private static subscriptions = new Set<() => void>();

  static override isSupported(): boolean {
    requireBrowserEnv();
    return true;
  }

  static getState(): BrowserTabActivityState {
    this.isSupported();
    if (document.visibilityState === 'hidden') return 'hidden';
    return document.hasFocus() ? 'focus' : 'blur';
  }

  static subscribe(handler: (state: BrowserTabActivityState) => void): BrowserSubscription {
    requireBrowserEnv();
    const emit = (): void => {
      return handler(this.getState());
    };

    window.addEventListener('focus', emit);
    window.addEventListener('blur', emit);
    document.addEventListener('visibilitychange', emit);

    const unsubscribe = (): void => {
      window.removeEventListener('focus', emit);
      window.removeEventListener('blur', emit);
      document.removeEventListener('visibilitychange', emit);
      this.subscriptions.delete(unsubscribe);
    };

    this.subscriptions.add(unsubscribe);
    return { unsubscribe };
  }

  static unsubscribe(): void {
    for (const unsubscribe of this.subscriptions) {
      unsubscribe();
    }
  }
}
