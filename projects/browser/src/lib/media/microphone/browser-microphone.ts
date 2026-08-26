import { isType, requireBrowserEnv } from '@trt-web/core';

import { AbstractBrowserUtils } from '../../browser.type';
import { BrowserPermission } from '../../permission/browser-permission';
import { BrowserMedia } from '../core/browser-media';
import type { BrowserMediaRecorderOptions } from '../core/browser-media.type';
import type { BrowserMediaRecorderSession } from '../core/browser-media-recorder-session';
import type {
  BrowserMicrophoneDevice,
  BrowserMicrophoneResult,
  BrowserMicrophoneStreamConstraints,
} from './browser-microphone.type';

/**
 * Microphone stream and device helpers.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
 * @see https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices
 */
export class BrowserMicrophone extends AbstractBrowserUtils {
  private static stream?: MediaStream;

  static get currentStream(): MediaStream | undefined {
    return this.stream;
  }

  static get isStreamActive(): boolean {
    return Boolean(this.stream?.active);
  }

  static override isSupported(): boolean {
    requireBrowserEnv();
    return BrowserMedia.isSupported() && isType('function', navigator.mediaDevices, 'getUserMedia');
  }

  static async listDevices(): Promise<BrowserMicrophoneDevice[]> {
    if (!this.isSupported()) {
      return [];
    }

    try {
      const devices = await BrowserMedia.listMediaDevices();
      return devices.filter((device) => device.kind === 'audioinput');
    } catch {
      return [];
    }
  }

  static async turnOn(
    options?: BrowserMicrophoneStreamConstraints,
  ): Promise<BrowserMicrophoneResult> {
    let permission = await BrowserPermission.getState('microphone');

    if (permission === 'unsupported') {
      return { permission, success: false };
    }

    if (permission !== 'granted') {
      permission = await BrowserPermission.request('microphone');
      if (permission !== 'granted') {
        return { permission, success: false };
      }
    }

    try {
      const stream = await BrowserMedia.getUserMedia({
        audio: options?.audio ?? true,
        video: false,
      });
      this.stream = stream;
      return { permission, data: stream, success: true };
    } catch {
      return { permission, success: false };
    }
  }

  static turnOff(): boolean {
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
