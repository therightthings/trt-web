import type { ExecuteBrowserServiceResult } from '../../permission/browser-permission.type';

export type BrowserMicrophoneStreamConstraints = Pick<MediaStreamConstraints, 'audio'>;
export type BrowserMicrophoneDevice = MediaDeviceInfo;
export type BrowserMicrophoneResult = ExecuteBrowserServiceResult<MediaStream>;
