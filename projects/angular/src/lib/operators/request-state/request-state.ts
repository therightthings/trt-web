import { concat, of, OperatorFunction } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { RequestState } from './request-state.type';

/**
 * RxJS operator that maps an Observable<T> into an Observable<RequestState<T>>.
 *
 * Behavior:
 * - Emits `{ state: 'loading' }` first
 * - Emits `{ state: 'done', data }` on success
 * - Emits `{ state: 'error', error }` on error
 *
 * @returns OperatorFunction<T, RequestState<T>>
 */
export function toRequestState<T>(): OperatorFunction<T, RequestState<T>> {
  return (source$) =>
    concat(
      of({ state: 'loading' } as RequestState<T>),
      source$.pipe(
        map((data) => {
          return { state: 'done', data } as RequestState<T>;
        }),
        catchError((error) => {
          return of({ state: 'error', error } as RequestState<T>);
        }),
      ),
    );
}
