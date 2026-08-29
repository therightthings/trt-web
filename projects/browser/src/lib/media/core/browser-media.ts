import { isType, requireBrowserEnv } from '@trt-web/core';

import { AbstractBrowserUtils } from '../../browser.type';
import type {
  BrowserDisplayMediaConstraints,
  BrowserMediaDevice,
  BrowserMediaRecorderOptions,
  BrowserMediaStreamConstraints,
} from './browser-media.type';
import { BrowserMediaRecorderSession } from './browser-media-recorder-session';

/**
 * Shared media stream and recording helpers.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices
 * @see https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder
 */
export class BrowserMedia extends AbstractBrowserUtils {
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

  static async createRecorder(
    stream: MediaStream,
    options?: BrowserMediaRecorderOptions,
  ): Promise<BrowserMediaRecorderSession | undefined> {
    if (!this.isRecorderSupported()) {
      return undefined;
    }

    const Recorder = this.mediaRecorder;
    if (!Recorder) {
      return undefined;
    }

    return BrowserMediaRecorderSession.create(stream, Recorder, options);
  }
}
