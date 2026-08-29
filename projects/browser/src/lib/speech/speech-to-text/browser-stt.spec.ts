// Run: npx vitest run projects/core/src/lib/browser/speech/speech-to-text/browser-stt.spec.ts
import { afterEach, describe, expect, it, vi } from 'vitest';

import { BrowserSpeechToText } from './browser-stt';
import type {
  BrowserSpeechRecognitionConstructor,
  BrowserSpeechRecognitionErrorEvent,
  BrowserSpeechRecognitionEvent,
  BrowserSpeechRecognitionInstance,
  BrowserSpeechWindow,
} from './browser-stt.type';

const stubBrowserShell = (Recognition?: BrowserSpeechRecognitionConstructor) => {
  vi.stubGlobal('navigator', { language: 'en-US' });
  vi.stubGlobal('document', {});
  const window = {
    document: {},
    clearTimeout,
    setTimeout,
  } as unknown as BrowserSpeechWindow;
  if (Recognition) {
    window.SpeechRecognition = Recognition;
  }
  vi.stubGlobal('window', window);
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('BrowserSpeechToText', () => {
  it('reports unsupported when recognition is unavailable', async () => {
    stubBrowserShell();

    expect(BrowserSpeechToText.isSupported()).toBe(false);
    await expect(BrowserSpeechToText.recognize()).resolves.toBeUndefined();
  });

  it('configures recognition and resolves the final transcript', async () => {
    let instance: Partial<BrowserSpeechRecognitionInstance> | undefined;
    const Recognition = vi.fn(function () {
      const result = {
        length: 1,
        isFinal: true,
        item: () => ({ transcript: ' hello world ', confidence: 0.9 }),
      };
      instance = {
        start: vi.fn(() => {
          instance?.onresult?.({
            resultIndex: 0,
            results: { length: 1, item: () => result, 0: result },
          } as unknown as BrowserSpeechRecognitionEvent);
          instance?.onend?.(new Event('end'));
        }),
        stop: vi.fn(),
        abort: vi.fn(),
        onresult: null,
        onerror: null,
        onend: null,
      };
      return instance;
    }) as unknown as BrowserSpeechRecognitionConstructor;
    stubBrowserShell(Recognition);

    await expect(
      BrowserSpeechToText.recognize({ lang: 'vi-VN', interimResults: true, maxAlternatives: 2 }),
    ).resolves.toBe('hello world');
    expect(instance?.lang).toBe('vi-VN');
    expect(instance?.interimResults).toBe(true);
    expect(instance?.maxAlternatives).toBe(2);
  });

  it('returns undefined and aborts when recognition reports an error', async () => {
    let instance: Partial<BrowserSpeechRecognitionInstance> | undefined;
    const Recognition = vi.fn(function () {
      instance = {
        start: vi.fn(() =>
          instance?.onerror?.({
            error: 'not-allowed',
            message: '',
          } as BrowserSpeechRecognitionErrorEvent),
        ),
        stop: vi.fn(),
        abort: vi.fn(),
        onresult: null,
        onerror: null,
        onend: null,
      };
      return instance;
    }) as unknown as BrowserSpeechRecognitionConstructor;
    stubBrowserShell(Recognition);

    await expect(BrowserSpeechToText.recognize()).resolves.toBeUndefined();
    expect(instance?.abort).toHaveBeenCalledOnce();
  });

  it('does not log an error when no speech is detected', async () => {
    let instance: Partial<BrowserSpeechRecognitionInstance> | undefined;
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const Recognition = vi.fn(function () {
      instance = {
        start: vi.fn(() =>
          instance?.onerror?.({
            error: 'no-speech',
            message: '',
          } as BrowserSpeechRecognitionErrorEvent),
        ),
        stop: vi.fn(),
        abort: vi.fn(),
        onresult: null,
        onerror: null,
        onend: null,
      };
      return instance;
    }) as unknown as BrowserSpeechRecognitionConstructor;
    stubBrowserShell(Recognition);

    await expect(BrowserSpeechToText.recognize()).resolves.toBeUndefined();
    expect(consoleError).not.toHaveBeenCalled();
    expect(instance?.abort).toHaveBeenCalledOnce();
  });

  it('returns undefined when recognition.start throws', async () => {
    const Recognition = vi.fn(function () {
      return {
        start: vi.fn(() => {
          throw new Error('start failed');
        }),
        stop: vi.fn(),
        abort: vi.fn(),
        onresult: null,
        onerror: null,
        onend: null,
      };
    }) as unknown as BrowserSpeechRecognitionConstructor;
    stubBrowserShell(Recognition);

    await expect(BrowserSpeechToText.recognize()).resolves.toBeUndefined();
  });

  it('returns undefined when recognition does not finish before timeout', async () => {
    let instance: Partial<BrowserSpeechRecognitionInstance> | undefined;
    const Recognition = vi.fn(function () {
      instance = {
        start: vi.fn(),
        stop: vi.fn(),
        abort: vi.fn(),
        onresult: null,
        onerror: null,
        onend: null,
      };
      return instance;
    }) as unknown as BrowserSpeechRecognitionConstructor;
    stubBrowserShell(Recognition);

    await expect(BrowserSpeechToText.recognize({ timeout: 0 })).resolves.toBeUndefined();
    expect(instance?.abort).toHaveBeenCalledOnce();
  });
});
