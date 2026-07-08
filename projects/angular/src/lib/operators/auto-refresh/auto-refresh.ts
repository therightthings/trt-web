import { defer, EMPTY, Observable, switchMap, timer } from 'rxjs';
import { expand } from 'rxjs/operators';

import { toMs } from '../../utils';
import { AutoRefreshConfig, AutoRefreshContext } from './auto-refresh.type';

export function autoRefresh<T>(
  source: (context: AutoRefreshContext) => Observable<T>,
  config?: AutoRefreshConfig,
): Observable<T> {
  const { delay = 0, maxRefreshCount = 0 } = config ?? {};
  const delayMs = toMs(delay);

  return defer(() => source({ isAutoRefresh: false, refreshCount: 0 })).pipe(
    expand((_, emissionIndex) => {
      if (delayMs <= 0 || maxRefreshCount <= 0) {
        return EMPTY;
      }

      if (emissionIndex >= maxRefreshCount) {
        return EMPTY;
      }

      return timer(delayMs).pipe(
        switchMap(() => source({ isAutoRefresh: true, refreshCount: emissionIndex + 1 })),
      );
    }),
  );
}
