import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { httpCacheInterceptor, provideHttpCache } from '@trt-web/angular';

import { appRoutes } from './app.routes';
import { mockHttpCacheBackendInterceptor } from './demos/data/mock-http-cache.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes, withComponentInputBinding()),
    provideHttpCache({
      ttl: 10 * 1000,
      debug: false,
    }),
    provideHttpClient(withInterceptors([httpCacheInterceptor, mockHttpCacheBackendInterceptor])),
  ],
};
