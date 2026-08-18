import { isType, requireBrowserEnv, toError } from '../../../utils';
import { AbstractBrowserUtils } from '../../abstract-browser';
import type { BrowserTextToSpeechOptions } from './browser-tts.type';

/**
 * Text-to-speech helpers based on the Web Speech API.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis
 * @see https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
 */
export class BrowserTextToSpeech extends AbstractBrowserUtils {
  static override isSupported(): boolean {
    requireBrowserEnv();
    return isType('object', window.speechSynthesis);
  }

  private static get speechSynthesis(): SpeechSynthesis | undefined {
    return this.isSupported() ? window.speechSynthesis : undefined;
  }

  static async speak(text: string, options?: BrowserTextToSpeechOptions): Promise<void> {
    const synth = this.speechSynthesis;
    if (!synth) {
      return Promise.reject(new Error('Speech synthesis is not supported'));
    }

    const { lang, pitch = 1, rate = 1, volume = 1, voice } = options ?? {};
    const utterance = new SpeechSynthesisUtterance(text);

    if (lang) {
      utterance.lang = lang;
    }
    utterance.pitch = pitch;
    utterance.rate = rate;
    utterance.volume = volume;

    if (voice) {
      const resolvedVoice = await this.resolveVoice(voice);
      if (resolvedVoice) {
        utterance.voice = resolvedVoice;
      }
    }

    return new Promise((resolve, reject) => {
      utterance.onend = () => {
        return resolve();
      };
      utterance.onerror = (event) => {
        const error = toError(event.error, 'Speech synthesis failed');
        console.error('Speech synthesis failed.', error);
        return reject(error);
      };
      try {
        synth.speak(utterance);
      } catch (error) {
        const normalizedError = toError(error, 'Could not start speech synthesis.');
        console.error(normalizedError);
        reject(normalizedError);
      }
    });
  }

  static async getVoices(): Promise<SpeechSynthesisVoice[]> {
    const synth = this.speechSynthesis;
    if (!synth) {
      return [];
    }

    const voices = synth.getVoices();
    if (voices.length > 0) {
      return voices;
    }

    const speechSynthesis = synth;

    return await new Promise((resolve) => {
      function cleanup(): void {
        window.clearTimeout(timeout);
        speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
      }

      function onVoicesChanged(): void {
        const next = speechSynthesis.getVoices();
        if (next.length === 0) {
          return;
        }
        cleanup();
        resolve(next);
      }

      const timeout = window.setTimeout(() => {
        cleanup();
        resolve(speechSynthesis.getVoices());
      }, 250);

      speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);
    });
  }

  static pause(): void {
    this.speechSynthesis?.pause();
  }

  static resume(): void {
    this.speechSynthesis?.resume();
  }

  static cancel(): void {
    this.speechSynthesis?.cancel();
  }

  static isSpeaking(): boolean {
    return this.speechSynthesis?.speaking ?? false;
  }

  static isPaused(): boolean {
    return this.speechSynthesis?.paused ?? false;
  }

  private static async resolveVoice(
    voice: string | SpeechSynthesisVoice,
  ): Promise<SpeechSynthesisVoice | undefined> {
    if (typeof voice !== 'string') {
      return voice;
    }

    const voices = await this.getVoices();
    const matchedVoice = voices.find((item) => {
      if (item.name === voice) {
        return true;
      }

      if (item.voiceURI === voice) {
        return true;
      }

      return false;
    });

    if (!matchedVoice) {
      return undefined;
    }

    return matchedVoice;
  }
}
