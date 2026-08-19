import { isType, requireBrowserEnv } from '../../../utils';
import { AbstractBrowserUtils } from '../../abstract-browser';
import type {
  BrowserDisplayMediaConstraints,
  BrowserMediaDevice,
  BrowserMediaRecorderOptions,
  BrowserMediaRecorderState,
  BrowserMediaRecordingHandlers,
  BrowserMediaRecordingResult,
  BrowserMediaStreamConstraints,
} from './browser-media.type';

/**
 * Shared media stream and recording helpers.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices
 * @see https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder
 */
export class BrowserMedia extends AbstractBrowserUtils {
  private static recorder: MediaRecorder | undefined;
  private static chunks: Blob[] = [];

  static override isSupported(): boolean {
    requireBrowserEnv();
    return isType('object', navigator, 'mediaDevices');
  }

  private static get mediaDevices(): MediaDevices | undefined {
    return this.isSupported() ? navigator.mediaDevices : undefined;
  }

  private static get mediaRecorder(): typeof MediaRecorder | undefined {
    return isType('function', window, 'MediaRecorder') ? window.MediaRecorder : undefined;
  }

  static async getUserMedia(constraints: BrowserMediaStreamConstraints): Promise<MediaStream> {
    const mediaDevices = this.mediaDevices;
    if (!mediaDevices) {
      return Promise.reject(new Error('Media devices are not supported.'));
    }

    return mediaDevices.getUserMedia(constraints);
  }

  static async getDisplayMedia(constraints?: BrowserDisplayMediaConstraints): Promise<MediaStream> {
    const mediaDevices = this.mediaDevices;
    if (!mediaDevices) {
      return Promise.reject(new Error('Display media is not supported.'));
    }

    return mediaDevices.getDisplayMedia(constraints);
  }

  static async listMediaDevices(): Promise<BrowserMediaDevice[]> {
    if (!this.isSupported()) {
      return [];
    }

    const mediaDevices = this.mediaDevices;
    return mediaDevices ? mediaDevices.enumerateDevices() : [];
  }

  static isRecorderSupported(): boolean {
    requireBrowserEnv();
    return Boolean(this.mediaRecorder);
  }

  static getRecorder(): MediaRecorder | undefined {
    return this.recorder;
  }

  static getRecorderState(): BrowserMediaRecorderState {
    return this.recorder?.state ?? 'inactive';
  }

  static createRecorder(
    stream: MediaStream,
    options?: MediaRecorderOptions,
  ): MediaRecorder | undefined {
    if (!this.isRecorderSupported()) {
      return undefined;
    }

    const Recorder = this.mediaRecorder;
    if (!Recorder) {
      return undefined;
    }

    if (this.recorder) {
      return undefined;
    }

    try {
      this.recorder = new Recorder(stream, options);
      this.chunks = [];
      return this.recorder;
    } catch {
      this.recorder = undefined;
      this.chunks = [];
      return undefined;
    }
  }

  static async startRecording(
    stream: MediaStream,
    options?: BrowserMediaRecorderOptions,
  ): Promise<MediaRecorder | undefined> {
    const { handlers = {}, timeslice, ...recorderOptions } = options ?? {};
    const recorder = this.createRecorder(stream, recorderOptions);
    if (!recorder) {
      return undefined;
    }

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.chunks.push(event.data);
      }
      handlers.onDataAvailable?.(event);
    };
    recorder.onerror = handlers.onError ?? null;
    recorder.onstart = handlers.onStart ?? null;
    recorder.onstop = handlers.onStop ?? null;
    recorder.onpause = handlers.onPause ?? null;
    recorder.onresume = handlers.onResume ?? null;

    try {
      recorder.start(timeslice);
      return recorder;
    } catch {
      this.stopRecording();
      return undefined;
    }
  }

  static pauseRecording(): boolean {
    if (!this.recorder || this.recorder.state !== 'recording') {
      return false;
    }

    try {
      this.recorder.pause();
      return true;
    } catch {
      return false;
    }
  }

  static resumeRecording(): boolean {
    if (!this.recorder || this.recorder.state !== 'paused') {
      return false;
    }

    try {
      this.recorder.resume();
      return true;
    } catch {
      return false;
    }
  }

  static requestRecordingData(): boolean {
    if (!this.recorder || this.recorder.state === 'inactive') {
      return false;
    }

    try {
      this.recorder.requestData();
      return true;
    } catch {
      return false;
    }
  }

  static stopRecording(): Promise<BrowserMediaRecordingResult | undefined> {
    if (!this.recorder) {
      return Promise.resolve(undefined);
    }

    const recorder = this.recorder;
    if (recorder.state === 'inactive') {
      return Promise.resolve(this.finalizeRecording(recorder));
    }

    return new Promise((resolve) => {
      const onStop = (): void => {
        recorder.removeEventListener('stop', onStop);
        resolve(this.finalizeRecording(recorder));
      };

      recorder.addEventListener('stop', onStop, { once: true });
      try {
        recorder.stop();
      } catch {
        recorder.removeEventListener('stop', onStop);
        resolve(undefined);
      }
    });
  }

  private static finalizeRecording(recorder: MediaRecorder): BrowserMediaRecordingResult {
    const mimeType = recorder.mimeType || 'application/octet-stream';
    const chunks = [...this.chunks];
    const result = { blob: new Blob(chunks, { type: mimeType }), chunks, mimeType };
    this.recorder = undefined;
    this.chunks = [];
    return result;
  }

  static isRecording(): boolean {
    return this.recorder?.state === 'recording';
  }

  static isPaused(): boolean {
    return this.recorder?.state === 'paused';
  }

  static isInactive(): boolean {
    return this.recorder?.state !== 'recording' && this.recorder?.state !== 'paused';
  }
}
