import { requireBrowserEnv } from '@trt-web/core';

import { BrowserPermission } from '../permission/browser-permission';
import { ExecuteBrowserServiceResult } from '../permission/browser-permission.type';

/**
 * Clipboard read and write helpers.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API
 */
export class BrowserClipboard {
  static async copy(text: string): Promise<ExecuteBrowserServiceResult> {
    requireBrowserEnv();

    let permission = await BrowserPermission.getState('clipboard-write');

    if (permission === 'unsupported') {
      const success = this.legacyCopy(text);
      return { permission, data: text, success };
    }

    if (permission != 'granted') {
      permission = await BrowserPermission.request('clipboard-write');

      if (permission != 'granted') {
        return { permission, success: false };
      }
    }

    await navigator.clipboard.writeText(text);

    return { permission, data: text, success: true };
  }

  static async read() {
    requireBrowserEnv();

    let state = await BrowserPermission.getState('clipboard-read');

    if (state === 'unsupported') {
      return null;
    }

    if (state != 'granted') {
      state = await BrowserPermission.request('clipboard-read');

      if (state != 'granted') {
        return;
      }
    }

    return await navigator.clipboard.readText();
  }

  private static legacyCopy(text: string): boolean {
    const textarea = document.createElement('textarea');
    textarea.value = text;

    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';

    document.body.appendChild(textarea);

    try {
      textarea.select();

      return document.execCommand('copy');
    } finally {
      document.body.removeChild(textarea);
    }
  }
}
