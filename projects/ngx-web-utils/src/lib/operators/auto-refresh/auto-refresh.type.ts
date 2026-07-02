import { TimeConfig } from '../../utils';

export type AutoRefreshConfig = {
  delay: number | TimeConfig;
  maxRefreshCount: number;
};

export type AutoRefreshContext = {
  isAutoRefresh: boolean;
  refreshCount: number;
};
