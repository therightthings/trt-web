import { requireBrowserEnv } from '../../utils';
import type {
  BrowserViewportConfig,
  BrowserViewportOrientation,
  BrowserViewportRangeName,
  BrowserViewportSize,
  BrowserViewportState,
  BrowserViewportSubscribeOptions,
  BrowserViewportSubscription,
} from './browser-viewport.type';

const DEFAULT_CONFIG: BrowserViewportConfig = {
  mobile: { max: 767 },
  tablet: { min: 768, max: 1023 },
  desktop: { min: 1024 },
};

/**
 * Share viewport size and breakpoint state across browser consumers.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/resize_event
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/innerWidth
 */
export class BrowserViewport {
  private static config: BrowserViewportConfig = { ...DEFAULT_CONFIG };
  private static subscriptions = new Set<{
    handler: (state: BrowserViewportState) => void;
    range?: BrowserViewportRangeName;
    unsubscribe: () => void;
  }>();
  private static listening = false;

  static register(config: BrowserViewportConfig): void {
    requireBrowserEnv();
    this.validateConfig(config);
    this.config = Object.fromEntries(
      Object.entries(config)
        .filter((entry): entry is [string, NonNullable<(typeof entry)[1]>] => {
          return entry[1] !== undefined;
        })
        .map(([name, range]) => [name, { ...range }]),
    );
    this.emit();
  }

  static getCurrentState(): BrowserViewportState {
    requireBrowserEnv();
    const size: BrowserViewportSize = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
    const orientation: BrowserViewportOrientation =
      size.width > size.height ? 'landscape' : 'portrait';
    const ranges = Object.entries(this.config)
      .filter(([, range]) => {
        if (!range) {
          return false;
        }

        return (
          (range.min === undefined || size.width >= range.min) &&
          (range.max === undefined || size.width <= range.max)
        );
      })
      .map(([name]) => name);

    return { ...size, ranges, orientation };
  }

  static isInRange(range: BrowserViewportRangeName): boolean {
    return this.getCurrentState().ranges.indexOf(range) > -1;
  }

  static subscribe(
    handler: (state: BrowserViewportState) => void,
    options?: BrowserViewportSubscribeOptions,
  ): BrowserViewportSubscription {
    requireBrowserEnv();
    const subscription = {
      handler,
      range: options?.range,
      unsubscribe: (): void => {
        this.subscriptions.delete(subscription);
        this.syncListener();
      },
    };

    this.subscriptions.add(subscription);
    this.syncListener();
    return { unsubscribe: subscription.unsubscribe };
  }

  private static emit = (): void => {
    const state = this.getCurrentState();
    for (const subscription of this.subscriptions) {
      if (!subscription.range || state.ranges.includes(subscription.range)) {
        subscription.handler(state);
      }
    }
  };

  private static syncListener(): void {
    if (this.subscriptions.size > 0 && !this.listening) {
      window.addEventListener('resize', this.emit);
      this.listening = true;
      return;
    }

    if (this.subscriptions.size === 0 && this.listening) {
      window.removeEventListener('resize', this.emit);
      this.listening = false;
    }
  }

  private static validateConfig(config: BrowserViewportConfig): void {
    if (!Object.keys(config).length) {
      throw new Error('Browser viewport config must contain at least one range.');
    }

    for (const [name, range] of Object.entries(config)) {
      if (!range) {
        continue;
      }

      if (range.min !== undefined && (!Number.isFinite(range.min) || range.min < 0)) {
        throw new Error(`Invalid minimum width for viewport range "${name}".`);
      }
      if (range.max !== undefined && (!Number.isFinite(range.max) || range.max < 0)) {
        throw new Error(`Invalid maximum width for viewport range "${name}".`);
      }
      if (range.min !== undefined && range.max !== undefined && range.min > range.max) {
        throw new Error(`Viewport range "${name}" has min greater than max.`);
      }
    }
  }
}
