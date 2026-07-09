export function createWorker<T, R>(fn: (data: T) => R | Promise<R>): Worker {
  const blob = new Blob(
    [
      `
      self.onmessage = async (e) => {
        try {
          const result = await (${fn.toString()})(e.data);
          self.postMessage({ ok: true, result });
        } catch (err) {
          self.postMessage({ ok: false, error: err?.message || 'Worker error' });
        }
      };
    `,
    ],
    { type: 'application/javascript' },
  );

  const url = URL.createObjectURL(blob);
  return new Worker(url, { type: 'module' });
}
