import type { BrowserSubscription } from '../../utils';
import { isType, requireBrowserEnv } from '../../utils';
import { AbstractBrowserUtils } from '../abstract-browser';
import type {
  BrowserNetworkConnection,
  BrowserNetworkNavigator,
  BrowserNetworkState,
} from './browser-network.type';

/**
 * Read network connectivity and connection quality changes.
 *
 * @example
 * ```ts
 * const subscription = BrowserNetwork.subscribe((state) => {
 *   console.log(state.status, state.effectiveType);
 * });
 *
 * subscription.unsubscribe();
 * ```
 *
 * Network status and connection information helpers.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Network_Information_API
 */
export class BrowserNetwork extends AbstractBrowserUtils {
  private static subscriptions = new Set<() => void>();

  static override isSupported(): boolean {
    requireBrowserEnv();
    return isType('boolean', navigator, 'onLine');
  }

  private static get connection(): BrowserNetworkConnection | undefined {
    if (!this.isSupported()) {
      return undefined;
    }

    return (navigator as BrowserNetworkNavigator).connection;
  }

  static getState(): BrowserNetworkState {
    const connection = this.connection;
    return {
      status: navigator.onLine ? 'online' : 'offline',
      effectiveType: connection?.effectiveType,
      downlink: connection?.downlink,
      rtt: connection?.rtt,
      saveData: connection?.saveData,
    };
  }

  static subscribe(handler: (state: BrowserNetworkState) => void): BrowserSubscription {
    requireBrowserEnv();
    const emit = (): void => {
      return handler(this.getState());
    };

    const connection = this.connection;

    window.addEventListener('online', emit);
    window.addEventListener('offline', emit);
    connection?.addEventListener('change', emit);

    const unsubscribe = (): void => {
      window.removeEventListener('online', emit);
      window.removeEventListener('offline', emit);
      connection?.removeEventListener('change', emit);
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
