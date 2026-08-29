import type { ExecuteBrowserServiceResult } from '../../permission/browser-permission.type';

export type BrowserCameraFacingMode = 'front' | 'back' | 'left' | 'right';
export type BrowserCameraNativeFacingMode = 'user' | 'environment' | 'left' | 'right';
export type BrowserCameraOptions = {
  facingMode?: BrowserCameraFacingMode;
  video?: MediaTrackConstraints;
};
export type BrowserCameraDevice = MediaDeviceInfo;
export type BrowserCameraResult = ExecuteBrowserServiceResult<MediaStream>;
