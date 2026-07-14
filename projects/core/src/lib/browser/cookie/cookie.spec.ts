// Run: npx vitest run projects/core/src/lib/browser/cookie/cookie.spec.ts
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Cookie } from './cookie';

function createCookieJarMock() {
  const jar = new Map<string, { value: string; path: string }>();
  const currentPath = '/app';

  const document = {} as Record<string, unknown>;

  Object.defineProperty(document, 'cookie', {
    configurable: true,
    enumerable: true,
    get: () =>
      Array.from(jar.entries())
        .filter(([, entry]) => currentPath.startsWith(entry.path))
        .map(([key, entry]) => `${encodeURIComponent(key)}=${entry.value}`)
        .join('; '),
    set: (raw: string) => {
      const parts = raw.split(';').map((part) => part.trim());
      const pair = parts[0] ?? '';
      const separatorIndex = pair.indexOf('=');
      if (separatorIndex === -1) return;

      const key = decodeURIComponent(pair.slice(0, separatorIndex));
      const value = pair.slice(separatorIndex + 1);
      const pathPart = parts.find((part) => part.toLowerCase().startsWith('path='));
      const expiresPart = parts.find((part) => part.toLowerCase().startsWith('expires='));
      const path = pathPart ? pathPart.slice('path='.length).trim() : '/';

      if (expiresPart) {
        const expires = new Date(expiresPart.slice('expires='.length).trim());
        if (!Number.isNaN(expires.getTime()) && expires.getTime() <= Date.now()) {
          const current = jar.get(key);
          if (!current || current.path === path) {
            jar.delete(key);
          }
          return;
        }
      }

      jar.set(key, { value, path });
    },
  });

  return { document, jar };
}

function stubBrowserShell(overrides?: {
  navigator?: Record<string, unknown>;
  document?: Record<string, unknown>;
}) {
  const cookieJar = createCookieJarMock();

  vi.stubGlobal('window', {
    document: cookieJar.document,
    ...overrides?.navigator,
  });
  vi.stubGlobal('navigator', {
    cookieEnabled: true,
    ...overrides?.navigator,
  });
  vi.stubGlobal('document', overrides?.document ?? cookieJar.document);

  return cookieJar;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('Cookie', () => {
  it('returns undefined when cookies are unavailable', () => {
    vi.stubGlobal('window', { document: {} });
    vi.stubGlobal('navigator', { cookieEnabled: false });
    vi.stubGlobal('document', {});

    expect(Cookie.get('missing')).toBeUndefined();
    expect(Cookie.exists('missing')).toBe(false);
  });

  it('stores and reads values back', () => {
    const cookieJar = stubBrowserShell();

    Cookie.set('profile', { id: 1, name: 'Alice' });

    expect(cookieJar.jar.get('profile')?.value).toBe(
      encodeURIComponent(JSON.stringify({ id: 1, name: 'Alice' })),
    );
    expect(Cookie.get('profile')).toEqual({ id: 1, name: 'Alice' });
  });

  it('supports TimeConfig durations', () => {
    const cookieJar = stubBrowserShell();

    Cookie.set('ttl', { ok: true }, { expiresIn: { value: 1, unit: 'hour' } });

    expect(cookieJar.jar.get('ttl')?.value).toBe(encodeURIComponent(JSON.stringify({ ok: true })));
    expect(Cookie.get('ttl')).toEqual({ ok: true });
  });

  it('supports exists, remove, and clear', () => {
    const cookieJar = stubBrowserShell();

    Cookie.set('a', { ok: true });
    Cookie.set('b', { ok: false });

    expect(Cookie.exists('a')).toBe(true);

    Cookie.remove('a');
    expect(Cookie.exists('a')).toBe(false);

    Cookie.clear();
    expect(Cookie.exists('b')).toBe(false);
  });

  it('returns undefined for invalid JSON payloads', () => {
    const cookieJar = stubBrowserShell();
    cookieJar.jar.set('broken', { value: '{not json', path: '/' });

    expect(Cookie.get('broken')).toBeUndefined();
  });

  it('clears cookies that were written with a custom path', () => {
    const cookieJar = stubBrowserShell();

    Cookie.set('scoped', { ok: true }, { path: '/app' });

    expect(Cookie.exists('scoped')).toBe(true);

    Cookie.clear();

    expect(Cookie.exists('scoped')).toBe(false);
    expect(cookieJar.jar.size).toBe(0);
  });
});
