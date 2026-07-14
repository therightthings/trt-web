// Run: npx vitest run projects/core/src/lib/browser/presentation/browser-presentation.spec.ts
import { afterEach, describe, expect, it, vi } from 'vitest';

import { BrowserPresentation } from './browser-presentation';

function stubBrowserShell(overrides?: {
  document?: Record<string, unknown>;
  element?: Record<string, unknown>;
  head?: Record<string, unknown>;
  video?: Record<string, unknown>;
  window?: Record<string, unknown>;
}) {
  const element = {
    requestFullscreen: vi.fn(),
    ...overrides?.element,
  } as unknown as Element;

  const video = {
    requestPictureInPicture: vi.fn(),
    ...overrides?.video,
  } as unknown as HTMLVideoElement;

  const head = {
    appendChild: vi.fn(),
    ...overrides?.head,
  };

  const body = {
    appendChild: vi.fn(),
    removeChild: vi.fn(),
  };

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
  } as unknown as HTMLLinkElement;

  const anchor = {
    click: vi.fn(),
    download: '',
    href: '',
    rel: '',
    target: '',
  };

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

  const document = {
    baseURI: 'https://example.com/app/',
    documentElement: element,
    exitFullscreen: vi.fn(),
    exitPictureInPicture: vi.fn(),
    head,
    body,
    createElement,
    ...overrides?.document,
  } as Record<string, unknown>;

  vi.stubGlobal('window', {
    document,
    ...overrides?.window,
  });
  vi.stubGlobal('document', document);

  return {
    anchor,
    body,
    createElement,
    head,
    document,
    element,
    link,
    script,
    video,
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('BrowserPresentation', () => {
  it('enters fullscreen on the provided element', async () => {
    const { element } = stubBrowserShell();

    await expect(BrowserPresentation.enterFullscreen(element)).resolves.toBe(true);
    expect(element.requestFullscreen).toHaveBeenCalledTimes(1);
  });

  it('exits fullscreen', async () => {
    const { document } = stubBrowserShell();

    await expect(BrowserPresentation.exitFullscreen()).resolves.toBe(true);
    expect(document['exitFullscreen']).toHaveBeenCalledTimes(1);
  });

  it('enters picture in picture for a video element', async () => {
    const { video } = stubBrowserShell();

    await expect(BrowserPresentation.enterPictureInPicture(video)).resolves.toBe(true);
    expect(video.requestPictureInPicture).toHaveBeenCalledTimes(1);
  });

  it('exits picture in picture', async () => {
    const { document } = stubBrowserShell();

    await expect(BrowserPresentation.exitPictureInPicture()).resolves.toBe(true);
    expect(document['exitPictureInPicture']).toHaveBeenCalledTimes(1);
  });

  it('returns false when fullscreen is not supported', async () => {
    stubBrowserShell({
      element: {
        requestFullscreen: undefined,
      },
    });

    await expect(BrowserPresentation.enterFullscreen()).resolves.toBe(false);
  });
});
