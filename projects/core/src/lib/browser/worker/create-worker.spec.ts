// Run: npx vitest run projects/core/src/lib/browser/worker/create-worker.spec.ts
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
});
