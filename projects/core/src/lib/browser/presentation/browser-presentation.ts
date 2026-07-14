import { requireBrowserEnv } from '../../utils';

export class BrowserPresentation {
  static async enterFullscreen(element?: Element): Promise<boolean> {
    requireBrowserEnv();

    const target = element ?? document.documentElement;

    if (typeof target.requestFullscreen !== 'function') {
      return false;
    }

    try {
      await target.requestFullscreen();

      return true;
    } catch {
      return false;
    }
  }

  static async exitFullscreen(): Promise<boolean> {
    requireBrowserEnv();

    if (typeof document.exitFullscreen !== 'function') {
      return false;
    }

    try {
      await document.exitFullscreen();

      return true;
    } catch {
      return false;
    }
  }

  static async enterPictureInPicture(video: HTMLVideoElement): Promise<boolean> {
    requireBrowserEnv();

    if (typeof video.requestPictureInPicture !== 'function') {
      return false;
    }

    try {
      await video.requestPictureInPicture();

      return true;
    } catch {
      return false;
    }
  }

  static async exitPictureInPicture(): Promise<boolean> {
    requireBrowserEnv();

    if (typeof document.exitPictureInPicture !== 'function') {
      return false;
    }

    try {
      await document.exitPictureInPicture();

      return true;
    } catch {
      return false;
    }
  }
}
