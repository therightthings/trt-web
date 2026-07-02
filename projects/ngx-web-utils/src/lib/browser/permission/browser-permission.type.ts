export type BrowserPermissionName =
  | 'camera'
  | 'geolocation'
  | 'microphone'
  | 'notifications'
  | 'clipboard-read'
  | 'clipboard-write'
  | 'persistent-storage'
  | 'midi'
  | 'push'
  | 'screen-wake-lock'
  | 'storage-access';

export type ExtraBrowserPermissionName = BrowserPermissionName | 'shared';

export type BrowserPermissionState = 'granted' | 'denied' | 'prompt' | 'unsupported';

export type ExecuteBrowserServiceResult<T = unknown> = {
  permission: BrowserPermissionState;
  success: boolean;
  data?: T | null;
};
