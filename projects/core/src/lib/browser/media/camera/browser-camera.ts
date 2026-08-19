import { isType, requireBrowserEnv } from '../../../utils';
import { AbstractBrowserUtils } from '../../abstract-browser';
import { BrowserPermission } from '../../permission/browser-permission';
import { BrowserMedia } from '../core/browser-media';
import type {
  BrowserMediaRecorderOptions,
  BrowserMediaRecordingResult,
} from '../core/browser-media.type';
import type {
  BrowserCameraDevice,
  BrowserCameraFacingMode,
  BrowserCameraNativeFacingMode,
  BrowserCameraOptions,
  BrowserCameraResult,
} from './browser-camera.type';

/**
 * Camera stream and device helpers.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
 * @see https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices
 */
export class BrowserCamera extends AbstractBrowserUtils {
  private static stream?: MediaStream;

  static get currentStream(): MediaStream | undefined {
    return this.stream;
  }

  static get isStreamActive(): boolean {
    return Boolean(this.stream?.active);
  }

  static async facingModes(): Promise<BrowserCameraFacingMode[]> {
    if (!this.isSupported()) {
      return [];
    }

    const nativeFacingModes: BrowserCameraNativeFacingMode[] = [
      'user',
      'environment',
      'left',
      'right',
    ];
    const facingModeMap: Record<BrowserCameraNativeFacingMode, BrowserCameraFacingMode> = {
      user: 'front',
      environment: 'back',
      left: 'left',
      right: 'right',
    };
    const currentTrack = this.stream?.getVideoTracks()[0];
    const supportedModes = currentTrack?.getCapabilities().facingMode;
    if (Array.isArray(supportedModes) && supportedModes.length) {
      return nativeFacingModes
        .filter((mode) => supportedModes.includes(mode))
        .map((mode) => facingModeMap[mode]);
    }

    const modes: BrowserCameraFacingMode[] = [];

    for (const mode of nativeFacingModes) {
      try {
        const stream = await BrowserMedia.getUserMedia({
          audio: false,
          video: { facingMode: { exact: mode } },
        });
        modes.push(facingModeMap[mode]);
        stream.getTracks().forEach((track) => track.stop());
      } catch {
        // The device does not support this facing mode.
      }
    }

    return modes;
  }

  static override isSupported(): boolean {
    requireBrowserEnv();
    return BrowserMedia.isSupported() && isType('function', navigator.mediaDevices, 'getUserMedia');
  }

  static async listDevices(): Promise<BrowserCameraDevice[]> {
    if (!this.isSupported()) {
      return [];
    }

    try {
      const devices = await BrowserMedia.listMediaDevices();
      return devices.filter((device) => {
        return device.kind === 'videoinput';
      });
    } catch {
      return [];
    }
  }

  static async turnOn(options?: BrowserCameraOptions): Promise<BrowserCameraResult> {
    let permission = await BrowserPermission.getState('camera');

    if (permission === 'unsupported') {
      return { permission, success: false };
    }

    if (permission != 'granted') {
      permission = await BrowserPermission.request('camera');

      if (permission != 'granted') {
        console.error('Please accept camera permission');
        return { permission, success: false };
      }
    }

    try {
      let nativeFacingMode: BrowserCameraNativeFacingMode = 'environment';
      if (options?.facingMode === 'front') {
        nativeFacingMode = 'user';
      } else if (options?.facingMode === 'back') {
        nativeFacingMode = 'environment';
      } else if (options?.facingMode) {
        nativeFacingMode = options.facingMode;
      }

      const stream = await BrowserMedia.getUserMedia({
        audio: false,
        video: {
          ...options?.video,
          facingMode: nativeFacingMode,
        },
      });
      this.stream = stream;
      return { permission, data: stream, success: true };
    } catch {
      console.error('Unable to access camera');
      return { permission, success: false };
    }
  }

  static turnOff(): boolean {
    if (!this.stream) {
      return false;
    }

    try {
      this.stream.getTracks().forEach((track) => {
        return track.stop();
      });
      this.stream = undefined;
      return true;
    } catch {
      return false;
    }
  }

  static requestRecordingData(): boolean {
    return BrowserMedia.requestRecordingData();
  }

  static startRecording(options?: BrowserMediaRecorderOptions): Promise<MediaRecorder | undefined> {
    if (!this.stream) {
      return Promise.resolve(undefined);
    }

    return BrowserMedia.startRecording(this.stream, options);
  }

  static pauseRecording(): boolean {
    return BrowserMedia.pauseRecording();
  }

  static resumeRecording(): boolean {
    return BrowserMedia.resumeRecording();
  }

  static async stopRecording(): Promise<BrowserMediaRecordingResult | undefined> {
    const recording = await BrowserMedia.stopRecording();
    return recording;
  }
}
