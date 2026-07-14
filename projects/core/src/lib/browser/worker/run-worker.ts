import { requireBrowserEnv } from '../../utils';
import { createWorker } from './create-worker';

export function runWorker<T, R>(fn: (data: T) => R | Promise<R>, data: T): Promise<R> {
  requireBrowserEnv();

  return new Promise((resolve, reject) => {
    const worker = createWorker(fn);

    worker.onmessage = (e: MessageEvent) => {
      const { ok, result, error } = e.data;
      worker.terminate();
      if (ok) resolve(result);
      else reject(new Error(error));
    };

    worker.onerror = (err) => {
      worker.terminate();
      reject(err);
    };

    worker.postMessage(data);
  });
}
