import type { BrowserSubscription } from '../browser.type';

export type BrowserBatteryState = {
  charging: boolean;
  percent: number;
  chargingTimeSeconds: number;
  dischargingTimeSeconds: number;
};

export type BrowserBatteryManager = EventTarget & {
  charging: boolean;
  level: number;
  chargingTime: number;
  dischargingTime: number;
};

export type BrowserBatteryNavigator = Navigator & {
  getBattery?: () => Promise<BrowserBatteryManager>;
};

export type BrowserBatterySubscription = BrowserSubscription;
