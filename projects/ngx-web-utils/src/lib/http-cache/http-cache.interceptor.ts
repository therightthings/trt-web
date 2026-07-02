import {
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { finalize, map, shareReplay, switchMap } from 'rxjs/operators';
import { generateHash } from '../string-handler';
import { HttpCacheService } from './http-cache.service';
import {
  HTTP_CACHE_GROUP_TOKEN,
  HTTP_CACHE_ID_TOKEN,
  HTTP_CACHE_OVERWRITE_TOKEN,
  HTTP_CACHE_TAGS_TOKEN,
  HTTP_CACHE_TTL_TOKEN,
} from './http-cache.token';

async function generateCacheKey(req: HttpRequest<unknown>): Promise<string> {
  let key = `${req.method}_${req.urlWithParams}`;
  if (req.body) {
    const hash = await generateHash(req.body);
    key += `_${hash}`;
  }
  return key;
}

export const httpCacheInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const cacheService = inject(HttpCacheService);

  const group = req.context.get(HTTP_CACHE_GROUP_TOKEN);
  const tags = req.context.get(HTTP_CACHE_TAGS_TOKEN);
  const id = req.context.get(HTTP_CACHE_ID_TOKEN);
  const ttl = req.context.get(HTTP_CACHE_TTL_TOKEN);
  const overwrite = req.context.get(HTTP_CACHE_OVERWRITE_TOKEN);

  if (!ttl || ttl <= 0) {
    return next(req);
  }

  return from(generateCacheKey(req)).pipe(
    switchMap((key) => {
      if (overwrite) {
        cacheService.delete(key);
      }

      const cached = cacheService.get(key);
      if (cached) {
        return of(cached.response.clone());
      }

      const pending = cacheService.getPending(key);
      if (pending) {
        return pending;
      }

      const request$ = next(req).pipe(
        map((event) => {
          if (event instanceof HttpResponse) {
            cacheService.set(key, {
              response: event.clone(),
              createdTime: Date.now(),
              ttl: ttl,
              group: group,
              tags: tags,
              id: id,
            });
          }
          return event;
        }),
        finalize(() => {
          cacheService.clearPending(key);
        }),
        shareReplay({ bufferSize: 1, refCount: false }),
      );

      cacheService.setPending(key, request$);
      return request$;
    }),
  );
};
