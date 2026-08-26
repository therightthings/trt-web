import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { type TimeConfig, toMs } from '@trt-web/core';

import { HttpCacheService } from './http-cache.service';

export function provideHttpCache(config: {
  ttl: TimeConfig | number;
  debug: boolean;
}): EnvironmentProviders {
  const globalConfig = HttpCacheService.globalConfig();
  const { debug = globalConfig.debug, ttl = globalConfig.ttl } = config;

  HttpCacheService.globalConfig.update((prev) => {
    return {
      ...prev,
      ttl: toMs(ttl),
      debug: debug,
    };
  });

  return makeEnvironmentProviders([]);
}
