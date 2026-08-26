// Run: npx vitest run projects/core/src/lib/browser/resource/browser-resource.spec.ts
import { afterEach, describe, expect, it, vi } from 'vitest';

import { BrowserResource } from './browser-resource';

function stubBrowserShell() {
  const anchor = {
    click: vi.fn(),
    download: '',
    href: '',
    rel: '',
    target: '',
  } as unknown as HTMLAnchorElement;

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

    if (tag === 'a') {
      return anchor;
    }

    return {};
  });

  const head = {
    appendChild: vi.fn(),
  };

  const body = {
    appendChild: vi.fn(),
    removeChild: vi.fn(),
  };

  const document = {
    baseURI: 'https://example.com/app/',
    body,
    createElement,
    head,
  };

  const open = vi.fn();

  vi.stubGlobal('window', { document, open });
  vi.stubGlobal('document', document);

  return {
    createElement,
    anchor,
    body,
    document,
    head,
    link,
    script,
    open,
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

  it('downloads a URL in the current tab without navigating it', async () => {
    const { anchor, body } = stubBrowserShell();
    const createObjectURL = vi.fn(() => 'blob:report');
    const revokeObjectURL = vi.fn();

    const fetch = vi
      .fn()
      .mockResolvedValueOnce({
        headers: { get: vi.fn(() => '1024') },
        ok: true,
      })
      .mockResolvedValueOnce({
        blob: vi.fn().mockResolvedValue(new Blob(['report'], { type: 'application/pdf' })),
        ok: true,
      });
    vi.stubGlobal('fetch', fetch);
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL });

    await BrowserResource.download('https://example.com/file.pdf', {
      name: 'report',
      ext: 'pdf',
      target: '_self',
    });

    expect(anchor.href).toBe('blob:report');
    expect(anchor.download).toBe('report.pdf');
    expect(anchor.target).toBe('_self');
    expect(anchor.rel).toBe('noopener noreferrer');
    expect(body.appendChild).toHaveBeenCalledWith(anchor);
    expect(anchor.click).toHaveBeenCalledTimes(1);
    expect(body.removeChild).toHaveBeenCalledWith(anchor);
    expect(fetch).toHaveBeenNthCalledWith(1, 'https://example.com/file.pdf', { method: 'HEAD' });
    expect(fetch).toHaveBeenNthCalledWith(2, 'https://example.com/file.pdf');
  });

  it('opens a large URL in a new tab when it exceeds the memory limit', async () => {
    const { anchor, open } = stubBrowserShell();
    const fetch = vi.fn().mockResolvedValue({
      headers: { get: vi.fn(() => '2048') },
      ok: true,
    });
    vi.stubGlobal('fetch', fetch);

    await BrowserResource.download('https://example.com/large.mp4', {
      target: '_self',
      maxBlobSize: { value: 1, unit: 'kb' },
    });

    expect(open).toHaveBeenCalledWith(
      'https://example.com/large.mp4',
      '_blank',
      'noopener,noreferrer',
    );
    expect(anchor.click).not.toHaveBeenCalled();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('opens a URL in a new tab when HEAD cannot determine its size', async () => {
    const { anchor, open } = stubBrowserShell();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        headers: { get: vi.fn(() => null) },
        ok: true,
      }),
    );

    await BrowserResource.download('https://example.com/unknown-size.mp4', {
      target: '_self',
    });

    expect(open).toHaveBeenCalledWith(
      'https://example.com/unknown-size.mp4',
      '_blank',
      'noopener,noreferrer',
    );
    expect(anchor.click).not.toHaveBeenCalled();
  });

  it('opens URLs in a new tab by default and with an explicit new-tab target', async () => {
    const { anchor, open } = stubBrowserShell();

    await BrowserResource.download('https://example.com/file.pdf');

    await BrowserResource.download('https://example.com/file.pdf', {
      target: '_blank',
    });

    expect(open).toHaveBeenCalledTimes(2);
    expect(open).toHaveBeenCalledWith(
      'https://example.com/file.pdf',
      '_blank',
      'noopener,noreferrer',
    );
    expect(anchor.click).not.toHaveBeenCalled();
  });

  it('checks the cache using the matching resource type', async () => {
    const performance = {
      getEntriesByName: vi.fn(() => [
        {
          decodedBodySize: 100,
          entryType: 'resource',
          transferSize: 0,
        },
      ]),
    };
    const { document } = stubBrowserShell();
    vi.stubGlobal('performance', performance);

    await expect(BrowserResource.isCached('image.png', { type: 'image' })).resolves.toBe(true);
    await expect(BrowserResource.isCached('file.pdf')).resolves.toBe(true);
    expect(performance.getEntriesByName).toHaveBeenCalledWith('image.png');
    expect(performance.getEntriesByName).toHaveBeenCalledWith(
      new URL('file.pdf', document.baseURI).href,
    );
  });
});
