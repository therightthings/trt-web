import { isType, requireBrowserEnv } from '@trt-web/core';

import { AbstractBrowserUtils } from '../../browser.type';
import { Canvas } from '../../canvas/canvas';
import { BrowserMedia } from '../core/browser-media';
import type { BrowserMediaRecorderOptions } from '../core/browser-media.type';
import type { BrowserMediaRecorderSession } from '../core/browser-media-recorder-session';
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

  static async screenshot(config?: BrowserScreenScreenshotConfig): Promise<Blob | undefined> {
    const { capture, image } = config ?? {};
    const stream = await this.startShare(capture);
    if (!stream) {
      return undefined;
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

      const session = Canvas.createSession();
      session.resize({
        devicePixelRatio: 1,
        height: video.videoHeight,
        width: video.videoWidth,
      });

      if (!video.videoWidth || !video.videoHeight) {
        return undefined;
      }

      if (
        !session.drawImage(video, {
          height: video.videoHeight,
          width: video.videoWidth,
        })
      ) {
        return undefined;
      }

      return await session.toBlob({
        quality: image?.quality,
        type: image?.type ?? 'image/png',
      });
    } catch {
      return undefined;
    } finally {
      video.pause();
      video.srcObject = null;
      this.stopShare();
    }
  }

  static createRecorder(
    options?: BrowserMediaRecorderOptions,
  ): Promise<BrowserMediaRecorderSession | undefined> {
    const stream = this.stream;
    if (!stream) {
      return Promise.resolve(undefined);
    }

    return BrowserMedia.createRecorder(stream, options);
  }
}
