// Run: npx vitest run projects/core/src/lib/browser/storage/session-storage.spec.ts
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SessionStorage } from './session-storage';

function createStorageMock() {
  const store = new Map<string, string>();

  return {
    getItem: vi.fn((key: string) => {
      if (!store.has(key)) {
        return null;
      }

      return store.get(key) ?? null;
    }),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, String(value));
    }),
    removeItem: vi.fn((key: string) => {
      store.delete(key);
    }),
    clear: vi.fn(() => {
      store.clear();
    }),
    store,
  };
}

function stubBrowserShell(overrides?: { window?: Record<string, unknown> }) {
  vi.stubGlobal('window', {
    document: {},
    ...overrides?.window,
  });
  vi.stubGlobal('document', {});
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('SessionStorage', () => {
  it('returns undefined when storage is unavailable', () => {
    stubBrowserShell();

    expect(SessionStorage.isSupported()).toBe(false);
    expect(SessionStorage.get('missing')).toBeUndefined();
    expect(SessionStorage.exists('missing')).toBe(false);
  });

  it('stores and reads values back', () => {
    const storage = createStorageMock();
    stubBrowserShell({
      window: { sessionStorage: storage },
    });
    vi.stubGlobal('sessionStorage', storage);

    expect(SessionStorage.isSupported()).toBe(true);
    SessionStorage.set('profile', { id: 1, name: 'Alice' });

    expect(storage.setItem).toHaveBeenCalledWith(
      'profile',
      JSON.stringify({ id: 1, name: 'Alice' }),
    );
    expect(SessionStorage.get('profile')).toEqual({ id: 1, name: 'Alice' });
  });

  it('supports exists, remove, and clear', () => {
    const storage = createStorageMock();
    stubBrowserShell({
      window: { sessionStorage: storage },
    });
    vi.stubGlobal('sessionStorage', storage);

    SessionStorage.set('a', { ok: true });
    SessionStorage.set('b', { ok: false });

    expect(SessionStorage.exists('a')).toBe(true);

    SessionStorage.remove('a');
    expect(SessionStorage.exists('a')).toBe(false);

    SessionStorage.clear();
    expect(SessionStorage.exists('b')).toBe(false);
  });

  it('returns undefined for invalid JSON payloads', () => {
    const storage = createStorageMock();
    storage.store.set('broken', '{not json');
    stubBrowserShell({
      window: { sessionStorage: storage },
    });
    vi.stubGlobal('sessionStorage', storage);

    expect(SessionStorage.get('broken')).toBeUndefined();
  });
});
