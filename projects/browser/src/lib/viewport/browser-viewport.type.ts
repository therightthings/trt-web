import type { BrowserSubscription } from '../browser.type';

export type BrowserViewportRangeConfig = {
  min?: number;
  max?: number;
};

export type BrowserViewportDefaultRange = 'mobile' | 'tablet' | 'desktop';

export type BrowserViewportRangeName = BrowserViewportDefaultRange | (string & {});

export type BrowserViewportConfig = {
  mobile?: BrowserViewportRangeConfig;
  tablet?: BrowserViewportRangeConfig;
  desktop?: BrowserViewportRangeConfig;
  [name: string]: BrowserViewportRangeConfig | undefined;
};

export type BrowserViewportSize = {
  width: number;
  height: number;
};

export type BrowserViewportOrientation = 'landscape' | 'portrait';

export type BrowserViewportState = BrowserViewportSize & {
  ranges: BrowserViewportRangeName[];
  orientation: BrowserViewportOrientation;
};

export type BrowserViewportSubscribeOptions = {
  range?: BrowserViewportRangeName;
};

export type BrowserViewportSubscription = BrowserSubscription;
