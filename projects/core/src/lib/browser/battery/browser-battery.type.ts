import type { BrowserSubscription } from '../../utils';

export type BrowserBatteryState = {
  charging: boolean;
  level: number;
  percent: number;
  chargingTime: number;
  dischargingTime: number;
};

export type BrowserBatteryManager = EventTarget & BrowserBatteryState;

export type BrowserBatteryNavigator = Navigator & {
  getBattery?: () => Promise<BrowserBatteryManager>;
};

export type BrowserBatterySubscription = BrowserSubscription;
