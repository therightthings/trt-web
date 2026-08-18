import { isType, requireBrowserEnv, toError } from '../../../utils';
import { AbstractBrowserUtils } from '../../abstract-browser';
import { BrowserEnvironment } from '../../environment/browser-environment';
import type {
  BrowserSpeechRecognitionConstructor,
  BrowserSpeechToTextOptions,
  BrowserSpeechWindow,
} from './browser-stt.type';

/**
 * Speech-to-text recognition helpers based on the Web Speech API.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
 */
export class BrowserSpeechToText extends AbstractBrowserUtils {
  static override isSupported(): boolean {
    requireBrowserEnv();

    const isWebkitSupported = isType('function', window, 'webkitSpeechRecognition');
    const isSpeechRecognitionSupported = isType('function', window, 'SpeechRecognition');

    return isWebkitSupported || isSpeechRecognitionSupported;
  }

  private static get Recognition(): BrowserSpeechRecognitionConstructor | undefined {
    if (!this.isSupported()) {
      return undefined;
    }

    const speechWindow = window as BrowserSpeechWindow;
    return speechWindow.webkitSpeechRecognition ?? speechWindow.SpeechRecognition;
  }

  static async recognize(options?: BrowserSpeechToTextOptions): Promise<string | undefined> {
    const Recognition = this.Recognition;
    if (!Recognition) {
      return undefined;
    }

    const {
      lang = BrowserEnvironment.getLocale(),
      interimResults = false,
      maxAlternatives = 1,
      timeout = 10000,
    } = options ?? {};

    const recognition = new Recognition();
    recognition.continuous = false;
    recognition.interimResults = interimResults;
    recognition.maxAlternatives = Number.isFinite(maxAlternatives)
      ? Math.max(1, Math.floor(maxAlternatives))
      : 1;
    recognition.lang = lang;

    return await new Promise((resolve) => {
      let transcript = '';
      let settled = false;
      const timeoutId = window.setTimeout(
        () => {
          try {
            recognition.abort();
          } catch (error) {
            console.error(toError(error, 'Could not stop speech recognition.'));
          }
          finish(undefined);
        },
        Math.max(0, timeout),
      );

      const finish = (value: string | undefined) => {
        if (settled) {
          return;
        }
        settled = true;
        window.clearTimeout(timeoutId);
        resolve(value);
      };

      recognition.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const result = event.results[i];
          const alternative = result.item(0);
          if (!alternative) {
            continue;
          }
          transcript = alternative.transcript.trim();

          if (result.isFinal) {
            try {
              recognition.stop();
            } catch (error) {
              console.error(toError(error, 'Could not stop speech recognition.'));
            }
            finish(transcript || undefined);
            break;
          }
        }
      };
      recognition.onerror = (event) => {
        if (event.error !== 'no-speech') {
          console.error('Speech recognition failed.', event);
        }
        try {
          recognition.abort();
        } catch (error) {
          console.error(toError(error, 'Could not abort speech recognition.'));
        }
        finish(undefined);
      };
      recognition.onend = () => {
        finish(transcript || undefined);
      };

      try {
        recognition.start();
      } catch (error) {
        const message = toError(error, 'Could not start speech recognition.');
        console.error(message);
        finish(undefined);
      }
    });
  }
}
