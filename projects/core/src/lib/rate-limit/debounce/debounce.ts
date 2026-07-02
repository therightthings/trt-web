import { toMs } from '../../utils';
import { DebounceOptions, DebouncedFunction } from './debounce.type';

type AnyFunction = (this: any, ...args: any[]) => any;
const now = () => Date.now();

/**
 * Create a debounced version of `func`.
 *
 * Behavior:
 * - `leading: true` invokes immediately on the first call in a burst.
 * - `trailing: true` invokes after the wait window ends.
 * - `maxWait` guarantees execution at least once within the given window.
 *
 * The returned function also exposes:
 * - `cancel()` to clear any pending invocation
 * - `flush()` to run a pending trailing invocation immediately
 * - `pending()` to check whether an invocation is queued
 */
export function debounce<T extends AnyFunction>(
  func: T,
  wait: number | Parameters<typeof toMs>[0] = 0,
  options: DebounceOptions = {},
): DebouncedFunction<T> {
  if (typeof func !== 'function') {
    throw new TypeError('Expected a function');
  }

  const waitMs = Math.max(0, toMs(wait));
  const leading = options.leading ?? false;
  const trailing = options.trailing ?? true;
  const maxing = options.maxWait !== undefined;
  const maxWaitMs = maxing
    ? Math.max(Math.max(0, toMs(options.maxWait as number | Parameters<typeof toMs>[0])), waitMs)
    : 0;

  let timerId: ReturnType<typeof setTimeout> | undefined;
  let lastArgs: Parameters<T> | undefined;
  let lastThis: ThisParameterType<T> | undefined;
  let lastCallTime: number | undefined;
  let lastInvokeTime = 0;
  let result: ReturnType<T> | undefined;

  const invokeFunc = (time: number) => {
    const args = lastArgs as Parameters<T>;
    const thisArg = lastThis as ThisParameterType<T>;

    lastArgs = undefined;
    lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  };

  const startTimer = (pendingFunction: () => void, delayMs: number) => {
    timerId = setTimeout(pendingFunction, delayMs);
  };

  const shouldInvoke = (time: number) => {
    if (lastCallTime === undefined) {
      return true;
    }

    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;

    return (
      timeSinceLastCall >= waitMs ||
      timeSinceLastCall < 0 ||
      (maxing && timeSinceLastInvoke >= maxWaitMs)
    );
  };

  const remainingWait = (time: number) => {
    const timeSinceLastCall = time - (lastCallTime ?? 0);
    const timeSinceLastInvoke = time - lastInvokeTime;
    const timeWaiting = waitMs - timeSinceLastCall;

    return maxing ? Math.min(timeWaiting, maxWaitMs - timeSinceLastInvoke) : timeWaiting;
  };

  const timerExpired = () => {
    const time = now();

    if (shouldInvoke(time)) {
      trailingEdge(time);
      return;
    }

    startTimer(timerExpired, remainingWait(time));
  };

  const leadingEdge = (time: number) => {
    lastInvokeTime = time;
    startTimer(timerExpired, waitMs);
    return leading ? invokeFunc(time) : result;
  };

  const trailingEdge = (time: number) => {
    timerId = undefined;

    if (trailing && lastArgs) {
      return invokeFunc(time);
    }

    lastArgs = undefined;
    lastThis = undefined;
    return result;
  };

  const cancel = () => {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }

    timerId = undefined;
    lastArgs = undefined;
    lastThis = undefined;
    lastCallTime = undefined;
    lastInvokeTime = 0;
  };

  const flush = () => {
    return timerId === undefined ? result : trailingEdge(Date.now());
  };

  const debounced = function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    const time = now();
    const isInvoking = shouldInvoke(time);

    lastArgs = args;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(time);
      }

      if (maxing) {
        clearTimeout(timerId);
        startTimer(timerExpired, waitMs);
        return invokeFunc(time);
      }
    }

    if (timerId === undefined) {
      startTimer(timerExpired, waitMs);
    }

    return result;
  } as DebouncedFunction<T>;

  debounced.cancel = cancel;
  debounced.flush = flush;
  debounced.pending = () => timerId !== undefined;

  return debounced;
}
