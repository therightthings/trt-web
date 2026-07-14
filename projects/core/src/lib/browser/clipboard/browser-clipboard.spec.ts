// Run: npx vitest run projects/core/src/lib/browser/clipboard/browser-clipboard.spec.ts
import { afterEach, describe, expect, it, vi } from 'vitest';

import { BrowserPermission } from '../permission/browser-permission';
import { BrowserClipboard } from './browser-clipboard';

function stubBrowserShell(overrides?: {
  clipboard?: Record<string, unknown>;
  document?: Record<string, unknown>;
  navigator?: Record<string, unknown>;
  window?: Record<string, unknown>;
}) {
  const textarea = {
    value: '',
    style: {},
    select: vi.fn(),
  };

  const body = {
    appendChild: vi.fn(),
    removeChild: vi.fn(),
  };

  const clipboard = {
    writeText: vi.fn(),
    readText: vi.fn(),
    ...overrides?.clipboard,
  };

  const document = {
    body,
    createElement: vi.fn(() => textarea),
    execCommand: vi.fn(() => true),
    ...overrides?.document,
  } as Record<string, unknown>;

  const navigator = {
    clipboard,
    ...overrides?.navigator,
  } as Record<string, unknown>;

  vi.stubGlobal('window', {
    document,
    ...overrides?.window,
  });
  vi.stubGlobal('document', document);
  vi.stubGlobal('navigator', navigator);

  return {
    body,
    clipboard,
    document,
    navigator,
    textarea,
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('BrowserClipboard', () => {
  it('copies with the native clipboard API when permission is granted', async () => {
    const { clipboard } = stubBrowserShell();
    const getStateSpy = vi.spyOn(BrowserPermission, 'getState').mockResolvedValue('granted');

    await expect(BrowserClipboard.copy('hello')).resolves.toEqual({
      permission: 'granted',
      data: 'hello',
      success: true,
    });
    expect(getStateSpy).toHaveBeenCalledWith('clipboard-write');
    expect(clipboard.writeText).toHaveBeenCalledWith('hello');
  });

  it('falls back to execCommand when clipboard-write is unsupported', async () => {
    const { body, document, textarea } = stubBrowserShell();
    vi.spyOn(BrowserPermission, 'getState').mockResolvedValue('unsupported');

    await expect(BrowserClipboard.copy('fallback text')).resolves.toEqual({
      permission: 'unsupported',
      data: 'fallback text',
      success: true,
    });
    expect(document['createElement']).toHaveBeenCalledWith('textarea');
    expect(body.appendChild).toHaveBeenCalledWith(textarea);
    expect(textarea.select).toHaveBeenCalled();
    expect(document['execCommand']).toHaveBeenCalledWith('copy');
    expect(body.removeChild).toHaveBeenCalledWith(textarea);
  });

  it('stops when clipboard-write permission is denied', async () => {
    const { clipboard } = stubBrowserShell();
    const getStateSpy = vi.spyOn(BrowserPermission, 'getState').mockResolvedValue('prompt');
    const requestSpy = vi.spyOn(BrowserPermission, 'request').mockResolvedValue('denied');

    await expect(BrowserClipboard.copy('blocked')).resolves.toEqual({
      permission: 'denied',
      success: false,
    });
    expect(getStateSpy).toHaveBeenCalledWith('clipboard-write');
    expect(requestSpy).toHaveBeenCalledWith('clipboard-write');
    expect(clipboard.writeText).not.toHaveBeenCalled();
  });

  it('reads text when clipboard-read permission is granted', async () => {
    const { clipboard } = stubBrowserShell({
      clipboard: {
        readText: vi.fn().mockResolvedValue('read value'),
        writeText: vi.fn(),
      },
    });
    vi.spyOn(BrowserPermission, 'getState').mockResolvedValue('granted');

    await expect(BrowserClipboard.read()).resolves.toBe('read value');
    expect(clipboard.readText).toHaveBeenCalledTimes(1);
  });

  it('returns undefined when clipboard-read permission is denied', async () => {
    const { clipboard } = stubBrowserShell();
    vi.spyOn(BrowserPermission, 'getState').mockResolvedValue('prompt');
    vi.spyOn(BrowserPermission, 'request').mockResolvedValue('denied');

    await expect(BrowserClipboard.read()).resolves.toBeUndefined();
    expect(clipboard.readText).not.toHaveBeenCalled();
  });
});
