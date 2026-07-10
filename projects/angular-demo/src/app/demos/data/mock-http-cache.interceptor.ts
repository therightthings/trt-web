import { HttpEvent, HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { MockHttpCacheService } from './mock-http-cache.service';

function isDemoRequest(req: HttpRequest<unknown>) {
  return req.method === 'GET' && req.url === '/api/demo/quote';
}

export const mockHttpCacheBackendInterceptor: HttpInterceptorFn = (
  req,
  next,
): Observable<HttpEvent<unknown>> => {
  if (!isDemoRequest(req)) {
    return next(req);
  }

  const demoService = inject(MockHttpCacheService);
  const payload = demoService.createQuote(req.params.get('topic') ?? 'utils');

  return of(
    new HttpResponse({
      status: 200,
      body: payload,
    }),
  ).pipe(delay(550));
};
