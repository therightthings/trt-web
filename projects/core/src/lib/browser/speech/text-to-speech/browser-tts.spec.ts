// Run: npx vitest run projects/core/src/lib/browser/speech/text-to-speech/browser-tts.spec.ts
import { afterEach, describe, expect, it, vi } from 'vitest';

import { BrowserTextToSpeech } from './browser-tts';

const stubSpeechSynthesis = (synthesis: Partial<SpeechSynthesis>) => {
  vi.stubGlobal('document', {});
  vi.stubGlobal('window', { speechSynthesis: synthesis });
  vi.stubGlobal(
    'SpeechSynthesisUtterance',
    class {
      lang = '';
      pitch = 1;
      rate = 1;
      volume = 1;
      voice: SpeechSynthesisVoice | null = null;
      onend: (() => void) | null = null;
      onerror: ((event: { error?: unknown }) => void) | null = null;

      constructor(readonly text: string) {}
    },
  );
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('BrowserTextToSpeech', () => {
  it('reports whether speech synthesis is supported', () => {
    stubSpeechSynthesis({});

    expect(BrowserTextToSpeech.isSupported()).toBe(true);
  });

  it('speaks with the configured options', async () => {
    let utterance: SpeechSynthesisUtterance | undefined;
    const speak = vi.fn((value: SpeechSynthesisUtterance) => {
      utterance = value;
      value.onend?.(new Event('end') as SpeechSynthesisEvent);
    });
    stubSpeechSynthesis({ speak });

    await BrowserTextToSpeech.speak('Hello', {
      lang: 'vi-VN',
      pitch: 1.2,
      rate: 0.8,
      volume: 0.6,
    });

    expect(speak).toHaveBeenCalledOnce();
    expect(utterance).toMatchObject({ lang: 'vi-VN', pitch: 1.2, rate: 0.8, volume: 0.6 });
  });

  it('rejects and logs when speech synthesis fails to start', async () => {
    const error = new Error('start failed');
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    stubSpeechSynthesis({
      speak: () => {
        throw error;
      },
    });

    await expect(BrowserTextToSpeech.speak('Hello')).rejects.toBe(error);
    expect(consoleError).toHaveBeenCalledWith(error);
  });

  it('rejects when the utterance reports an error', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const speak = vi.fn((value: SpeechSynthesisUtterance) => {
      value.onerror?.({ error: 'canceled' } as SpeechSynthesisErrorEvent);
    });
    stubSpeechSynthesis({ speak });

    await expect(BrowserTextToSpeech.speak('Hello')).rejects.toThrow('canceled');
    expect(consoleError).toHaveBeenCalledOnce();
  });

  it('returns voices that are already available', async () => {
    const voices = [{ name: 'English', voiceURI: 'en-US' }] as SpeechSynthesisVoice[];
    stubSpeechSynthesis({ getVoices: () => voices });

    await expect(BrowserTextToSpeech.getVoices()).resolves.toBe(voices);
  });

  it('controls speech synthesis state', () => {
    const synthesis = {
      pause: vi.fn(),
      resume: vi.fn(),
      cancel: vi.fn(),
      speaking: true,
      paused: false,
    };
    stubSpeechSynthesis(synthesis);

    BrowserTextToSpeech.pause();
    BrowserTextToSpeech.resume();
    BrowserTextToSpeech.cancel();

    expect(synthesis.pause).toHaveBeenCalledOnce();
    expect(synthesis.resume).toHaveBeenCalledOnce();
    expect(synthesis.cancel).toHaveBeenCalledOnce();
    expect(BrowserTextToSpeech.isSpeaking()).toBe(true);
    expect(BrowserTextToSpeech.isPaused()).toBe(false);
  });
});
