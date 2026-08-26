// Run: npx vitest run projects/core/src/lib/worker-handler/create-worker.spec.ts
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createWorker } from './create-worker';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('createWorker', () => {
  it('throws when browser environment is unavailable', () => {
    expect(() => createWorker(() => 1)).toThrow(
      'This function can only be used in a browser environment.',
    );
  });

  it('uses module workers when they are supported', () => {
    vi.stubGlobal('window', { document: {} });
    vi.stubGlobal('document', {});

    const createObjectURL = vi.fn(() => 'blob:worker');
    const revokeObjectURL = vi.fn();
    const workerInstance = {
      postMessage: vi.fn(),
      terminate: vi.fn(),
    } as unknown as Worker;
    const calls: Array<{ url: string; options?: WorkerOptions }> = [];

    function workerCtor(this: unknown, url: string, options?: WorkerOptions) {
      calls.push({ url, options });
      return workerInstance;
    }

    vi.stubGlobal('Blob', Blob);
    vi.stubGlobal('URL', {
      createObjectURL,
      revokeObjectURL,
    });
    vi.stubGlobal('Worker', workerCtor as unknown as typeof Worker);

    const worker = createWorker((value: number) => value + 1);

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(calls).toEqual([{ url: 'blob:worker', options: { type: 'module' } }]);
    expect(worker).toBe(workerInstance);
  });

  it('falls back to a classic worker when module workers are unsupported', () => {
    vi.stubGlobal('window', { document: {} });
    vi.stubGlobal('document', {});

    const createObjectURL = vi.fn(() => 'blob:worker');
    const revokeObjectURL = vi.fn();
    const workerInstance = {
      postMessage: vi.fn(),
      terminate: vi.fn(),
    } as unknown as Worker;
    const calls: Array<{ url: string; options?: WorkerOptions }> = [];

    function workerCtor(this: unknown, url: string, options?: WorkerOptions) {
      calls.push({ url, options });

      if (options?.type === 'module') {
        throw new Error('module worker unsupported');
      }

      return workerInstance;
    }

    vi.stubGlobal('Blob', Blob);
    vi.stubGlobal('URL', {
      createObjectURL,
      revokeObjectURL,
    });
    vi.stubGlobal('Worker', workerCtor as unknown as typeof Worker);

    const worker = createWorker((value: number) => value + 1);

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(calls).toEqual([
      { url: 'blob:worker', options: { type: 'module' } },
      { url: 'blob:worker', options: undefined },
    ]);
    expect(worker).toBe(workerInstance);
  });
});
