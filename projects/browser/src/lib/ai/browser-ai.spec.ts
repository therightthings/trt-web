import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BrowserAI } from './browser-ai';

describe('BrowserAI', () => {
  let browserWindow: Record<string, unknown>;

  const createApi = <T extends Record<string, unknown>>(api: T): T & ReturnType<typeof vi.fn> => {
    return Object.assign(vi.fn(), api);
  };

  beforeEach(() => {
    browserWindow = {};
    vi.stubGlobal('window', browserWindow);
    vi.stubGlobal('document', {});
    Object.assign(browserWindow, {
      LanguageDetector: undefined,
      Summarizer: undefined,
      Translator: undefined,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('checks support for each API and for the overall Browser AI utility', () => {
    expect(BrowserAI.isSupported()).toBe(false);
    expect(BrowserAI.supportedFeatures()).toEqual({
      languageDetector: false,
      summarizer: false,
      translator: false,
    });

    browserWindow.Translator = createApi({
      availability: vi.fn(),
      create: vi.fn(),
    });

    expect(BrowserAI.isSupported()).toBe(true);
    expect(BrowserAI.isLanguageDetectorSupported()).toBe(false);
    expect(BrowserAI.isSummarizerSupported()).toBe(false);
    expect(BrowserAI.isTranslatorSupported()).toBe(true);
    expect(BrowserAI.supportedFeatures()).toEqual({
      languageDetector: false,
      summarizer: false,
      translator: true,
    });
  });

  it('returns unavailable when an API is missing', async () => {
    await expect(BrowserAI.detectAvailability()).resolves.toBe('unavailable');
    await expect(BrowserAI.summarizeAvailability()).resolves.toBe('unavailable');
    await expect(BrowserAI.translateAvailability()).resolves.toBe('unavailable');
  });

  it('returns unavailable when an availability check rejects', async () => {
    browserWindow.LanguageDetector = createApi({
      availability: vi.fn().mockRejectedValue(new Error('availability failed')),
      create: vi.fn(),
    });
    browserWindow.Summarizer = createApi({
      availability: vi.fn().mockRejectedValue(new Error('availability failed')),
      create: vi.fn(),
    });
    browserWindow.Translator = createApi({
      availability: vi.fn().mockRejectedValue(new Error('availability failed')),
      create: vi.fn(),
    });

    await expect(BrowserAI.detectAvailability()).resolves.toBe('unavailable');
    await expect(BrowserAI.summarizeAvailability()).resolves.toBe('unavailable');
    await expect(
      BrowserAI.translateAvailability({ sourceLanguage: 'en', targetLanguage: 'vi' }),
    ).resolves.toBe('unavailable');
  });

  it('detects language and destroys the session', async () => {
    const destroy = vi.fn();
    const detect = vi.fn().mockResolvedValue([{ detectedLanguage: 'en', confidence: 0.99 }]);
    const signal = new AbortController().signal;
    const onProgress = vi.fn();
    const monitor = {
      addEventListener: vi.fn((_type, listener) => {
        listener({ loaded: 0.5 } as Event & { loaded: number });
      }),
    };
    const create = vi.fn().mockImplementation((options) => {
      options.monitor?.(monitor);
      return { detect, destroy };
    });
    browserWindow.LanguageDetector = createApi({
      availability: vi.fn().mockResolvedValue('available'),
      create,
    });

    await expect(BrowserAI.detectLanguage('Hello', { signal, onProgress })).resolves.toEqual([
      { detectedLanguage: 'en', confidence: 0.99 },
    ]);
    expect(create).toHaveBeenCalledWith({ signal, monitor: expect.any(Function) });
    expect(onProgress).toHaveBeenCalledTimes(3);
    expect(onProgress).toHaveBeenNthCalledWith(1, { phase: 'downloading', progress: 0.5 });
    expect(onProgress).toHaveBeenNthCalledWith(2, { phase: 'processing', progress: 0 });
    expect(onProgress).toHaveBeenNthCalledWith(3, { phase: 'done', progress: 1 });
    expect(detect).toHaveBeenCalledWith('Hello');
    expect(destroy).toHaveBeenCalledOnce();
  });

  it('summarizes and translates while cleaning up sessions', async () => {
    const summarizeDestroy = vi.fn();
    const translateDestroy = vi.fn();
    const summarizeProgress = vi.fn();
    const translateProgress = vi.fn();
    const summarizeMonitor = {
      addEventListener: vi.fn((_type, listener) => {
        listener({ loaded: 0.75 } as Event & { loaded: number });
      }),
    };
    const translateMonitor = {
      addEventListener: vi.fn((_type, listener) => {
        listener({ loaded: 1 } as Event & { loaded: number });
      }),
    };
    const summarizeCreate = vi.fn().mockImplementation((options) => {
      options.monitor?.(summarizeMonitor);
      return {
        summarize: vi.fn().mockResolvedValue('Summary'),
        destroy: summarizeDestroy,
      };
    });
    const translateCreate = vi.fn().mockImplementation((options) => {
      options.monitor?.(translateMonitor);
      return {
        translate: vi.fn().mockResolvedValue('Xin chao'),
        destroy: translateDestroy,
      };
    });
    browserWindow.Summarizer = createApi({
      availability: vi.fn().mockResolvedValue('available'),
      create: summarizeCreate,
    });
    browserWindow.Translator = createApi({
      availability: vi.fn().mockResolvedValue('available'),
      create: translateCreate,
    });

    await expect(
      BrowserAI.summarize('Long text', {
        type: 'key-points',
        format: 'plain-text',
        length: 'short',
        context: 'Product documentation',
        onProgress: summarizeProgress,
      }),
    ).resolves.toBe('Summary');
    await expect(
      BrowserAI.translate('Hello', {
        sourceLanguage: 'en',
        targetLanguage: 'vi',
        onProgress: translateProgress,
      }),
    ).resolves.toBe('Xin chao');
    expect(summarizeDestroy).toHaveBeenCalledOnce();
    expect(translateDestroy).toHaveBeenCalledOnce();
    expect(summarizeProgress).toHaveBeenNthCalledWith(1, {
      phase: 'downloading',
      progress: 0.75,
    });
    expect(summarizeProgress).toHaveBeenNthCalledWith(2, { phase: 'processing', progress: 0 });
    expect(summarizeProgress).toHaveBeenNthCalledWith(3, { phase: 'done', progress: 1 });
    expect(translateProgress).toHaveBeenNthCalledWith(1, { phase: 'downloading', progress: 1 });
    expect(translateProgress).toHaveBeenNthCalledWith(2, { phase: 'processing', progress: 0 });
    expect(translateProgress).toHaveBeenNthCalledWith(3, { phase: 'done', progress: 1 });
  });

  it('destroys a session when an operation rejects', async () => {
    const destroy = vi.fn();
    browserWindow.Summarizer = createApi({
      availability: vi.fn().mockResolvedValue('available'),
      create: vi.fn().mockResolvedValue({
        summarize: vi.fn().mockRejectedValue(new Error('summarize failed')),
        destroy,
      }),
    });

    await expect(BrowserAI.summarize('Long text')).rejects.toThrow('summarize failed');
    expect(destroy).toHaveBeenCalledOnce();
  });

  it('throws a clear error when a requested API is unavailable', async () => {
    await expect(BrowserAI.detectLanguage('Hello')).rejects.toThrow(
      'Browser Language Detector API is not available.',
    );
    await expect(BrowserAI.summarize('Hello')).rejects.toThrow(
      'Browser Summarizer API is not available.',
    );
    await expect(
      BrowserAI.translate('Hello', { sourceLanguage: 'en', targetLanguage: 'vi' }),
    ).rejects.toThrow('Browser Translator API is not available.');
  });
});
