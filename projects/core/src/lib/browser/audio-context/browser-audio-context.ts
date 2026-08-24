import { isType, requireBrowserEnv, toError } from '../../utils';
import { AbstractBrowserUtils } from '../abstract-browser';
import type {
  BrowserAudioContextToneSequenceOptions,
  BrowserAudioContextWindow,
} from './browser-audio-context.type';
import { BrowserAudioSession } from './browser-audio-session';

/**
 * Shared Web Audio context and audio session helpers.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/AudioContext
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
 */
export class BrowserAudioContext extends AbstractBrowserUtils {
  static #instance?: BrowserAudioContext;
  private audioContext?: AudioContext;

  private constructor() {
    super();
  }

  static override isSupported(): boolean {
    requireBrowserEnv();

    return (
      isType('function', window, 'AudioContext') || isType('function', window, 'webkitAudioContext')
    );
  }

  static getInstance(): BrowserAudioContext {
    if (!BrowserAudioContext.#instance) {
      BrowserAudioContext.#instance = new BrowserAudioContext();
    }

    return BrowserAudioContext.#instance;
  }

  private get AudioContextConstructor(): typeof AudioContext | undefined {
    if (!BrowserAudioContext.isSupported()) {
      return undefined;
    }

    const audioWindow = window as BrowserAudioContextWindow;
    return audioWindow.AudioContext ?? audioWindow.webkitAudioContext;
  }

  async ready(options?: AudioContextOptions): Promise<AudioContext | undefined> {
    if (this.audioContext) {
      if (this.audioContext.state === 'suspended') {
        await this.resume();
      }
      return this.audioContext;
    }

    const AudioContextConstructor = this.AudioContextConstructor;
    if (!AudioContextConstructor) {
      return undefined;
    }

    try {
      this.audioContext = new AudioContextConstructor(options);
      if (this.audioContext.state === 'suspended') {
        await this.resume();
      }
      return this.audioContext;
    } catch (error) {
      console.error(toError(error, 'Could not create AudioContext.'));
      return undefined;
    }
  }

  getState(): AudioContextState | undefined {
    return this.audioContext?.state;
  }

  createAudioSession(buffer: AudioBuffer): BrowserAudioSession | undefined {
    if (!this.audioContext) {
      return undefined;
    }

    return new BrowserAudioSession(this.audioContext, buffer);
  }

  async suspend(): Promise<boolean> {
    if (!this.audioContext) {
      return false;
    }

    try {
      await this.audioContext.suspend();
      return true;
    } catch (error) {
      console.error(toError(error, 'Could not suspend AudioContext.'));
      return false;
    }
  }

  async resume(): Promise<boolean> {
    if (!this.audioContext) {
      return false;
    }

    try {
      await this.audioContext.resume();
      return true;
    } catch (error) {
      console.error(toError(error, 'Could not resume AudioContext.'));
      return false;
    }
  }

  async decodeAudioData(arrayBuffer: ArrayBuffer): Promise<AudioBuffer | undefined> {
    const context = await this.ready();
    if (!context) {
      return undefined;
    }

    try {
      return await context.decodeAudioData(arrayBuffer);
    } catch (error) {
      console.error(toError(error, 'Could not decode audio data.'));
      return undefined;
    }
  }

  async playTone(options: BrowserAudioContextToneSequenceOptions): Promise<boolean> {
    const context = await this.ready();
    if (!context || options.tones.length === 0) {
      return false;
    }

    const startTime = context.currentTime;
    let offsetMs = 0;

    try {
      for (const tone of options.tones) {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const startAt = startTime + offsetMs / 1000;
        const endAt = startAt + tone.durationMs / 1000;

        oscillator.type = tone.type ?? 'sine';
        oscillator.frequency.value = tone.frequency ?? 440;
        oscillator.detune.value = tone.detune ?? 0;
        gain.gain.value = tone.gain ?? 0.1;
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(startAt);
        oscillator.stop(endAt);

        offsetMs += tone.durationMs + (tone.gapMs ?? 0);
      }

      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, offsetMs);
      });
      return true;
    } catch (error) {
      console.error(toError(error, 'Could not play tone sequence.'));
      return false;
    }
  }

  async close(): Promise<void> {
    if (!this.audioContext) {
      return;
    }

    try {
      await this.audioContext.close();
    } catch (error) {
      console.error(toError(error, 'Could not close AudioContext.'));
    } finally {
      this.audioContext = undefined;
    }
  }
}
