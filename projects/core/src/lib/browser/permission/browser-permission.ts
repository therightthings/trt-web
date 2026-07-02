import { BrowserPermissionState, ExtraBrowserPermissionName } from './browser-permission.type';

export class BrowserPermission {
  static async getState(name: ExtraBrowserPermissionName): Promise<BrowserPermissionState> {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return 'unsupported';
    }

    switch (name) {
      case 'push': {
        return this.getPushState();
      }
      case 'shared': {
        return this.getSharedState();
      }

      default: {
        if (!('permissions' in navigator)) {
          return 'unsupported';
        }

        try {
          const status = await navigator.permissions.query({ name } as PermissionDescriptor);

          return status.state as BrowserPermissionState;
        } catch {
          return 'unsupported';
        }
      }
    }
  }

  static async request(name: ExtraBrowserPermissionName): Promise<BrowserPermissionState> {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return 'unsupported';
    }

    switch (name) {
      case 'geolocation': {
        return this.requestGeolocation();
      }

      case 'camera': {
        return this.requestMedia({ video: true });
      }

      case 'microphone': {
        return this.requestMedia({ audio: true });
      }

      case 'notifications': {
        return this.requestNotification();
      }

      case 'clipboard-read': {
        return this.requestClipboardRead();
      }

      case 'clipboard-write': {
        return await this.getState('clipboard-write');
      }

      case 'persistent-storage': {
        return this.requestPersistentStorage();
      }

      case 'midi': {
        return this.requestMidi();
      }

      case 'push': {
        return this.requestPush();
      }

      case 'screen-wake-lock': {
        return this.requestScreenWakeLock();
      }

      case 'storage-access': {
        return this.requestStorageAccess();
      }

      case 'shared': {
        return this.requestShared();
      }

      default: {
        return 'unsupported';
      }
    }
  }

  private static async requestGeolocation(): Promise<BrowserPermissionState> {
    if (!('geolocation' in navigator)) {
      return 'unsupported';
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        () => resolve('granted'),
        (err) => {
          if (err.code === err.PERMISSION_DENIED) {
            resolve('denied');
          } else {
            resolve('prompt');
          }
        },
      );
    });
  }

  private static async requestMedia(
    constraints: MediaStreamConstraints,
  ): Promise<BrowserPermissionState> {
    if (!('mediaDevices' in navigator)) {
      return 'unsupported';
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      stream.getTracks().forEach((t) => t.stop());

      return 'granted';
    } catch {
      return 'denied';
    }
  }

  private static async requestNotification(): Promise<BrowserPermissionState> {
    if (!('Notification' in window)) {
      return 'unsupported';
    }

    const result = await Notification.requestPermission();

    if (result === 'default') {
      return 'prompt';
    }

    if (result === 'granted' || result === 'denied') {
      return result;
    }

    return 'unsupported';
  }

  private static async requestClipboardRead(): Promise<BrowserPermissionState> {
    if (!navigator.clipboard?.readText) {
      return 'unsupported';
    }

    try {
      await navigator.clipboard.readText();

      return 'granted';
    } catch {
      return 'denied';
    }
  }

  private static async requestPersistentStorage(): Promise<BrowserPermissionState> {
    if (!navigator.storage?.persist) {
      return 'unsupported';
    }

    const granted = await navigator.storage.persist();

    return granted ? 'granted' : 'denied';
  }

  private static async requestMidi(): Promise<BrowserPermissionState> {
    if (!('requestMIDIAccess' in navigator)) {
      return 'unsupported';
    }

    try {
      await navigator.requestMIDIAccess({ sysex: false });

      return 'granted';
    } catch {
      return this.getState('midi');
    }
  }

  private static async getPushState(): Promise<BrowserPermissionState> {
    if (!('serviceWorker' in navigator)) {
      return 'unsupported';
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration();

      if (!registration?.pushManager) {
        return 'unsupported';
      }

      const state = await registration.pushManager.permissionState({
        userVisibleOnly: true,
      });

      return state as BrowserPermissionState;
    } catch {
      return 'unsupported';
    }
  }

  private static async requestPush(): Promise<BrowserPermissionState> {
    if (!('serviceWorker' in navigator)) {
      return 'unsupported';
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration();

      if (!registration?.pushManager) {
        return 'unsupported';
      }

      const currentState = await registration.pushManager.permissionState({
        userVisibleOnly: true,
      });

      if (currentState !== 'prompt') {
        return currentState as BrowserPermissionState;
      }

      if (!('Notification' in window)) {
        return 'prompt';
      }

      const notificationPermission = await Notification.requestPermission();

      if (notificationPermission === 'denied') {
        return 'denied';
      }

      const nextState = await registration.pushManager.permissionState({
        userVisibleOnly: true,
      });

      return nextState as BrowserPermissionState;
    } catch {
      return 'unsupported';
    }
  }

  private static async requestScreenWakeLock(): Promise<BrowserPermissionState> {
    if (!('wakeLock' in navigator)) {
      return 'unsupported';
    }

    try {
      const sentinel = await navigator.wakeLock.request('screen');
      await sentinel.release();

      return 'granted';
    } catch {
      return 'denied';
    }
  }

  private static async requestStorageAccess(): Promise<BrowserPermissionState> {
    if (typeof document === 'undefined' || !('requestStorageAccess' in document)) {
      return 'unsupported';
    }

    try {
      await document.requestStorageAccess();

      return 'granted';
    } catch {
      return 'denied';
    }
  }

  private static async getSharedState(): Promise<BrowserPermissionState> {
    if (!navigator.share) {
      return 'unsupported';
    }

    if (
      navigator.canShare &&
      !navigator.canShare({
        text: 'test shared data',
      })
    ) {
      return 'denied';
    }

    return 'granted';
  }

  private static async requestShared(): Promise<BrowserPermissionState> {
    try {
      await navigator.share({
        text: 'request shared data',
      });

      return 'granted';
    } catch {
      return 'denied';
    }
  }
}
