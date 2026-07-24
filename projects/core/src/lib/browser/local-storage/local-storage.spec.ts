// Run: npx vitest run projects/core/src/lib/browser/storage/local-storage.spec.ts
import { afterEach, describe, expect, it, vi } from 'vitest';

import { LocalStorage } from './local-storage';

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

describe('LocalStorage', () => {
  it('returns undefined when storage is unavailable', () => {
    stubBrowserShell();

    expect(LocalStorage.isSupported()).toBe(false);
    expect(LocalStorage.get('missing')).toBeUndefined();
    expect(LocalStorage.exists('missing')).toBe(false);
  });

  it('stores and reads values back', () => {
    const storage = createStorageMock();
    stubBrowserShell({
      window: { localStorage: storage },
    });
    vi.stubGlobal('localStorage', storage);

    expect(LocalStorage.isSupported()).toBe(true);
    LocalStorage.set('profile', { id: 1, name: 'Alice' });

    expect(storage.setItem).toHaveBeenCalledWith(
      'profile',
      JSON.stringify({ id: 1, name: 'Alice' }),
    );
    expect(LocalStorage.get('profile')).toEqual({ id: 1, name: 'Alice' });
  });

  it('supports exists, remove, and clear', () => {
    const storage = createStorageMock();
    stubBrowserShell({
      window: { localStorage: storage },
    });
    vi.stubGlobal('localStorage', storage);

    LocalStorage.set('a', { ok: true });
    LocalStorage.set('b', { ok: false });

    expect(LocalStorage.exists('a')).toBe(true);

    LocalStorage.remove('a');
    expect(LocalStorage.exists('a')).toBe(false);

    LocalStorage.clear();
    expect(LocalStorage.exists('b')).toBe(false);
  });

  it('returns undefined for invalid JSON payloads', () => {
    const storage = createStorageMock();
    storage.store.set('broken', '{not json');
    stubBrowserShell({
      window: { localStorage: storage },
    });
    vi.stubGlobal('localStorage', storage);

    expect(LocalStorage.get('broken')).toBeUndefined();
  });
});
