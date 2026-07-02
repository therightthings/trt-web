import { toMs } from '../../utils';
import { debounce } from '../debounce/debounce';
import { ThrottleOptions, ThrottledFunction } from './throttle.type';

type AnyFunction = (this: any, ...args: any[]) => any;

/**
 * Create a throttled version of `func`.
 *
 * The throttled function invokes `func` at most once per `wait` window.
 * It supports the same leading/trailing behavior as lodash:
 * - `leading: true` invokes on the first call in a burst
 * - `trailing: true` invokes after the wait window ends
 *
 * The returned function also exposes:
 * - `cancel()` to clear any pending invocation
 * - `flush()` to invoke the pending trailing call immediately
 * - `pending()` to check whether a call is queued
 *
 * Internally this is implemented with `debounce(..., { maxWait: wait })`,
 * which matches lodash's throttle semantics.
 */
export function throttle<T extends AnyFunction>(
  func: T,
  wait: number | Parameters<typeof toMs>[0] = 0,
  options: ThrottleOptions = {},
): ThrottledFunction<T> {
  if (typeof func !== 'function') {
    throw new TypeError('Expected a function');
  }

  const leading = options.leading ?? true;
  const trailing = options.trailing ?? true;

  return debounce(func, wait, {
    leading,
    trailing,
    maxWait: wait,
  }) as ThrottledFunction<T>;
}
