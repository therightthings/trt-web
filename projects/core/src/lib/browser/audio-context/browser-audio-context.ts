import { isType, requireBrowserEnv, toError } from '../../utils';
import { AbstractBrowserUtils } from '../abstract-browser';
import type { BrowserAudioContextWindow } from './browser-audio-context.type';
import { BrowserAudioSession } from './browser-audio-session';

export class BrowserAudioContext extends AbstractBrowserUtils {
  static #instance?: BrowserAudioContext;
  private audioContext?: AudioContext;

  private constructor() {
    super();
  }

  static getInstance(): BrowserAudioContext {
    if (!BrowserAudioContext.#instance) {
      BrowserAudioContext.#instance = new BrowserAudioContext();
    }

    return BrowserAudioContext.#instance;
  }

  static override isSupported(): boolean {
    requireBrowserEnv();

    return (
      isType('function', window, 'AudioContext') || isType('function', window, 'webkitAudioContext')
    );
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
