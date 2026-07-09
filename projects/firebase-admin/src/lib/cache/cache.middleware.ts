import type { NextFunction, Request, Response } from 'express';

import { TimeConfig } from '../utils';
import { CacheService } from './cache.service';
import { NetworkCacheService } from './network-cache.service';

export interface ResponseBodyData<T> {
  status?: number;
  message?: string;
  data?: T | null;
  errors?: any[] | null;
}

export type AuthorizedRequest = Request & {
  context: {
    user: {
      id: string;
    };
  };
};

export const withCache = (config?: TimeConfig) => {
  const { value = 5, unit = 'minute' } = config ?? {};
  return (req: AuthorizedRequest, res: Response, next: NextFunction) => {
    if (req.method !== 'GET') {
      return next();
    }

    const cacheService = NetworkCacheService.getInstance();
    const debug = CacheService.config.debug;
    const userId = req.context.user.id;
    const key = cacheService.getNetworkKey({
      userId,
      url: req.originalUrl,
    });
    const cached = cacheService.get(key);
    if (debug) {
      console.log('[cache-middleware] key', {
        key,
        userId,
        url: req.originalUrl,
      });
    }

    if (key && cached) {
      if (debug) {
        console.log(`[cache-middleware] served from ${key}`);
      }
      res.setHeader('from-cache', 'true');
      return res.json(cached);
    }
    if (debug) {
      console.log(`[cache-middleware] cache miss ${key}`);
    }

    const originalJson = res.json;

    res.json = function (data: ResponseBodyData<any>) {
      const status = res.statusCode;
      if ([200].includes(status)) {
        if (debug) {
          console.log(`[cache-middleware] new data ${key}`);
        }
        cacheService.set(key, data, {
          value,
          unit,
        });
      }

      return originalJson.call(this, data);
    };

    next();
  };
};
