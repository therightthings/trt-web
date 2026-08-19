import { isType, requireBrowserEnv } from '../../../utils';
import { AbstractBrowserUtils } from '../../abstract-browser';
import { BrowserMedia } from '../core/browser-media';
import type {
  BrowserMediaRecorderOptions,
  BrowserMediaRecordingResult,
} from '../core/browser-media.type';
import type {
  BrowserScreenScreenshotConfig,
  BrowserScreenStreamConstraints,
} from './browser-screen.type';

/**
 * Screen and window capture helpers.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API
 */
export class BrowserScreen extends AbstractBrowserUtils {
  private static stream?: MediaStream;

  static get currentStream(): MediaStream | undefined {
    return this.stream;
  }

  static get isStreamActive(): boolean {
    return Boolean(this.stream?.active);
  }

  static override isSupported(): boolean {
    requireBrowserEnv();
    return (
      BrowserMedia.isSupported() && isType('function', navigator.mediaDevices, 'getDisplayMedia')
    );
  }

  static async startShare(
    constraints?: BrowserScreenStreamConstraints,
  ): Promise<MediaStream | null> {
    if (!this.isSupported()) {
      return null;
    }

    this.stopShare();
    try {
      const stream = await BrowserMedia.getDisplayMedia(constraints);
      this.stream = stream;
      return stream;
    } catch {
      return null;
    }
  }

  static stopShare(): boolean {
    if (!this.stream) {
      return false;
    }

    try {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = undefined;
      return true;
    } catch {
      return false;
    }
  }

  static async screenshot(config: BrowserScreenScreenshotConfig = {}): Promise<Blob | null> {
    const stream = await this.startShare(config.capture);
    if (!stream) {
      return null;
    }

    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.srcObject = stream;

    try {
      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => resolve();
        video.onerror = () => reject(new Error('Could not load the screen stream.'));
      });

      await video.play();

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      if (!canvas.width || !canvas.height) {
        return null;
      }

      const context = canvas.getContext('2d');
      if (!context) {
        return null;
      }

      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      return await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, config.image?.type ?? 'image/png', config.image?.quality);
      });
    } catch {
      return null;
    } finally {
      video.pause();
      video.srcObject = null;
      this.stopShare();
    }
  }

  static startRecording(options?: BrowserMediaRecorderOptions): Promise<MediaRecorder | undefined> {
    const stream = this.stream;
    if (!stream) {
      return Promise.resolve(undefined);
    }

    return BrowserMedia.startRecording(stream, options);
  }

  static async stopRecording(): Promise<BrowserMediaRecordingResult | undefined> {
    const recording = await BrowserMedia.stopRecording();
    return recording;
  }

  static pauseRecording(): boolean {
    return BrowserMedia.pauseRecording();
  }

  static resumeRecording(): boolean {
    return BrowserMedia.resumeRecording();
  }

  static requestRecordingData(): boolean {
    return BrowserMedia.requestRecordingData();
  }
}
