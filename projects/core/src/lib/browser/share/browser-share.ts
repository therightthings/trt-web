import {
  BrowserPermissionState,
  ExecuteBrowserServiceResult,
} from '../permission/browser-permission.type';
import { BrowserShareData } from './browser-share.type';

export class BrowserShare {
  static async share(data: BrowserShareData): Promise<ExecuteBrowserServiceResult> {
    const permission = this.getSharedState(data);

    if (permission === 'unsupported') {
      return { permission, success: false };
    }

    if (permission != 'granted') {
      return { permission, success: false };
    }

    try {
      await navigator.share(data);
    } catch {
      return { permission, success: false };
    }

    return { permission, data, success: true };
  }

  private static getSharedState(data?: ShareData): BrowserPermissionState {
    if (!navigator.share) {
      return 'unsupported';
    }

    try {
      if (navigator.canShare && !navigator.canShare(data)) {
        return 'denied';
      }
    } catch {
      return 'denied';
    }

    return 'granted';
  }
}
