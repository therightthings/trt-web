// Run: npx vitest run projects/core/src/lib/browser/resource/browser-resource.spec.ts
import { afterEach, describe, expect, it, vi } from 'vitest';

import { BrowserResource } from './browser-resource';

function stubBrowserShell() {
  const script = {
    async: false,
    defer: false,
    onerror: undefined,
    onload: undefined,
    remove: vi.fn(),
    src: '',
  } as unknown as HTMLScriptElement & { remove: ReturnType<typeof vi.fn> };

  const link = {
    href: '',
    onerror: undefined,
    onload: undefined,
    rel: '',
    remove: vi.fn(),
  } as unknown as HTMLLinkElement & { remove: ReturnType<typeof vi.fn> };

  const createElement = vi.fn((tag: string) => {
    if (tag === 'script') {
      return script;
    }

    if (tag === 'link') {
      return link;
    }

    return {};
  });

  const head = {
    appendChild: vi.fn(),
  };

  const document = {
    baseURI: 'https://example.com/app/',
    createElement,
    head,
  } as Record<string, unknown>;

  vi.stubGlobal('window', { document });
  vi.stubGlobal('document', document);

  return {
    createElement,
    document,
    head,
    link,
    script,
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('BrowserResource', () => {
  it('removes script nodes after they load', async () => {
    const { head, script } = stubBrowserShell();

    const promise = BrowserResource.loadScript('https://example.com/app.js');

    expect(head.appendChild).toHaveBeenCalledTimes(1);
    expect(script.src).toBe('https://example.com/app.js');

    (script.onload as (() => void) | undefined)?.();

    await expect(promise).resolves.toBeUndefined();
    expect(script.remove).toHaveBeenCalledTimes(1);
  });

  it('removes script nodes when they fail to load', async () => {
    const { head, script } = stubBrowserShell();

    const promise = BrowserResource.loadScript('https://example.com/fail.js');

    expect(head.appendChild).toHaveBeenCalledTimes(1);

    (script.onerror as (() => void) | undefined)?.();

    await expect(promise).rejects.toThrow('Could not load https://example.com/fail.js');
    expect(script.remove).toHaveBeenCalledTimes(1);
  });

  it('keeps link nodes in the DOM after they load', async () => {
    const { head, link } = stubBrowserShell();

    const promise = BrowserResource.loadLink('https://example.com/app.css');

    expect(head.appendChild).toHaveBeenCalledTimes(1);
    expect(link.rel).toBe('stylesheet');
    expect(link.href).toBe('https://example.com/app.css');

    (link.onload as (() => void) | undefined)?.();

    await expect(promise).resolves.toBeUndefined();
    expect(link.remove).not.toHaveBeenCalled();
  });

  it('removes link nodes when they fail to load', async () => {
    const { head, link } = stubBrowserShell();

    const promise = BrowserResource.loadLink('https://example.com/fail.css');

    expect(head.appendChild).toHaveBeenCalledTimes(1);

    (link.onerror as (() => void) | undefined)?.();

    await expect(promise).rejects.toThrow('Could not load https://example.com/fail.css');
    expect(link.remove).toHaveBeenCalledTimes(1);
  });
});
