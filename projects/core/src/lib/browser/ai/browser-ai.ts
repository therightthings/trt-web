import { isType, requireBrowserEnv } from '../../utils';
import { AbstractBrowserUtils } from '../abstract-browser';
import type {
  BrowserAIAvailability,
  BrowserAIDetection,
  BrowserAIDownloadMonitorHandler,
  BrowserAILanguageDetector,
  BrowserAIProgress,
  BrowserAIProgressHandler,
  BrowserAISummarizeOptions,
  BrowserAISummarizer,
  BrowserAISupportedFeatures,
  BrowserAITranslateOptions,
  BrowserAITranslator,
  BrowserAIWindow,
} from './browser-ai.type';

/**
 * Browser built-in AI helpers for language detection, summarization and translation.
 *
 * @see https://developer.chrome.com/docs/ai/built-in
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Translator_and_Language_Detector_APIs
 */
export class BrowserAI extends AbstractBrowserUtils {
  static override isSupported(): boolean {
    requireBrowserEnv();
    const features = this.supportedFeatures();
    return features.languageDetector || features.summarizer || features.translator;
  }

  static isLanguageDetectorSupported(): boolean {
    requireBrowserEnv();
    return isType('function', window, 'LanguageDetector');
  }

  static isSummarizerSupported(): boolean {
    requireBrowserEnv();
    return isType('function', window, 'Summarizer');
  }

  static isTranslatorSupported(): boolean {
    requireBrowserEnv();
    return isType('function', window, 'Translator');
  }

  static supportedFeatures(): BrowserAISupportedFeatures {
    return {
      languageDetector: this.isLanguageDetectorSupported(),
      summarizer: this.isSummarizerSupported(),
      translator: this.isTranslatorSupported(),
    };
  }

  private static get languageDetector(): BrowserAILanguageDetector | undefined {
    if (!this.isLanguageDetectorSupported()) {
      return undefined;
    }
    return (window as BrowserAIWindow).LanguageDetector;
  }

  private static get summarizer(): BrowserAISummarizer | undefined {
    if (!this.isSummarizerSupported()) {
      return undefined;
    }
    return (window as BrowserAIWindow).Summarizer;
  }

  private static get translator(): BrowserAITranslator | undefined {
    if (!this.isTranslatorSupported()) {
      return undefined;
    }
    return (window as BrowserAIWindow).Translator;
  }

  static async detectAvailability(): Promise<BrowserAIAvailability> {
    const detector = this.languageDetector;

    if (!detector) {
      return 'unavailable';
    }

    try {
      return await detector.availability();
    } catch {
      return 'unavailable';
    }
  }

  static async summarizeAvailability(
    options?: Pick<BrowserAISummarizeOptions, 'type' | 'format' | 'length'>,
  ): Promise<BrowserAIAvailability> {
    const summarizer = this.summarizer;
    if (!summarizer) {
      return 'unavailable';
    }

    try {
      return await summarizer.availability(options);
    } catch {
      return 'unavailable';
    }
  }

  static async translateAvailability(
    options?: Pick<BrowserAITranslateOptions, 'sourceLanguage' | 'targetLanguage'>,
  ): Promise<BrowserAIAvailability> {
    const translator = this.translator;
    if (!translator) {
      return 'unavailable';
    }

    try {
      return await translator.availability(options);
    } catch {
      return 'unavailable';
    }
  }

  static async detectLanguage(
    input: string,
    options?: { signal?: AbortSignal; onProgress?: BrowserAIProgressHandler },
  ): Promise<BrowserAIDetection[]> {
    const languageDetector = this.languageDetector;
    if (!languageDetector) {
      throw new Error('Browser Language Detector API is not available.');
    }

    const session = await languageDetector.create({
      signal: options?.signal,
      monitor: this.createProgressMonitor(options?.onProgress),
    });

    try {
      this.emitProgress(options?.onProgress, { phase: 'processing', progress: 0 });
      const result = await session.detect(input);
      this.emitProgress(options?.onProgress, { phase: 'done', progress: 1 });
      return result;
    } finally {
      session.destroy();
    }
  }

  static async summarize(input: string, options?: BrowserAISummarizeOptions): Promise<string> {
    const summarizer = this.summarizer;
    if (!summarizer) {
      throw new Error('Browser Summarizer API is not available.');
    }

    const { onProgress, ...createOptions } = options ?? {};
    const session = await summarizer.create({
      ...createOptions,
      monitor: this.createProgressMonitor(onProgress),
    });

    try {
      this.emitProgress(onProgress, { phase: 'processing', progress: 0 });
      const result = await session.summarize(input, {
        context: options?.context,
        signal: options?.signal,
      });
      this.emitProgress(onProgress, { phase: 'done', progress: 1 });
      return result;
    } finally {
      session.destroy();
    }
  }

  static async translate(input: string, options: BrowserAITranslateOptions): Promise<string> {
    const translator = this.translator;
    if (!translator) {
      throw new Error('Browser Translator API is not available.');
    }

    const { onProgress, ...createOptions } = options;
    const session = await translator.create({
      ...createOptions,
      monitor: this.createProgressMonitor(onProgress),
    });

    try {
      this.emitProgress(onProgress, { phase: 'processing', progress: 0 });
      const result = await session.translate(input);
      this.emitProgress(onProgress, { phase: 'done', progress: 1 });
      return result;
    } finally {
      session.destroy();
    }
  }

  private static createProgressMonitor(
    onProgress?: BrowserAIProgressHandler,
  ): BrowserAIDownloadMonitorHandler | undefined {
    if (!onProgress) {
      return undefined;
    }

    return (monitor) => {
      monitor.addEventListener('downloadprogress', (event) => {
        onProgress({ phase: 'downloading', progress: event.loaded });
      });
    };
  }

  private static emitProgress(
    onProgress: BrowserAIProgressHandler | undefined,
    state: BrowserAIProgress,
  ): void {
    onProgress?.(state);
  }
}
