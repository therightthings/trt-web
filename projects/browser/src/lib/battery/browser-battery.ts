import { isType, requireBrowserEnv } from '@trt-web/core';

import type { BrowserSubscription } from '../browser.type';
import { AbstractBrowserUtils } from '../browser.type';
import type {
  BrowserBatteryManager,
  BrowserBatteryNavigator,
  BrowserBatteryState,
} from './browser-battery.type';

/**
 * Read battery status and observe charging or battery level changes.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Battery_Status_API
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Navigator/getBattery
 */
export class BrowserBattery extends AbstractBrowserUtils {
  static override isSupported(): boolean {
    requireBrowserEnv();
    return isType('function', navigator, 'getBattery');
  }

  private static get battery(): Promise<BrowserBatteryManager | undefined> {
    if (!this.isSupported()) {
      return Promise.resolve(undefined);
    }

    const getter = (navigator as BrowserBatteryNavigator).getBattery;
    return getter ? getter.call(navigator).catch(() => undefined) : Promise.resolve(undefined);
  }

  private static getStateFromBattery(battery: BrowserBatteryManager): BrowserBatteryState {
    const { charging, level, chargingTime, dischargingTime } = battery;
    const percent = level <= 1 ? Math.round(level * 100) : level;
    let normalizedChargingTime = chargingTime;
    if (percent >= 100) {
      normalizedChargingTime = 0;
    } else if (chargingTime === Infinity) {
      normalizedChargingTime = Number.MAX_SAFE_INTEGER;
    }

    let normalizedDischargingTime = dischargingTime;
    if (dischargingTime === Infinity) {
      normalizedDischargingTime = Number.MAX_SAFE_INTEGER;
    }

    return {
      charging,
      percent,
      chargingTimeSeconds: normalizedChargingTime,
      dischargingTimeSeconds: normalizedDischargingTime,
    };
  }

  static async getState(): Promise<BrowserBatteryState | undefined> {
    const battery = await this.battery;
    return battery ? this.getStateFromBattery(battery) : undefined;
  }

  static async subscribe(
    handler: (state: BrowserBatteryState) => void,
  ): Promise<BrowserSubscription> {
    const battery = await this.battery;
    if (!battery) {
      return { unsubscribe: () => undefined };
    }

    const emit = (): void => {
      handler(this.getStateFromBattery(battery));
    };
    const events = [
      'chargingchange',
      'levelchange',
      'chargingtimechange',
      'dischargingtimechange',
    ] as const;

    for (const event of events) {
      battery.addEventListener(event, emit);
    }

    const unsubscribe = (): void => {
      for (const event of events) {
        battery.removeEventListener(event, emit);
      }
    };

    return { unsubscribe };
  }
}
