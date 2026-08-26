import type { TimeConfig } from '@trt-web/core';

export type AutoRefreshConfig = {
  delay: number | TimeConfig;
  maxRefreshCount: number;
};

export type AutoRefreshContext = {
  isAutoRefresh: boolean;
  refreshCount: number;
};
