import { isType, requireBrowserEnv } from '@trt-web/core';

import { AbstractBrowserUtils } from '../browser.type';
import { BrowserPermission } from '../permission/browser-permission';
import type {
  BrowserNotificationOptions,
  BrowserNotificationPermission,
  BrowserNotificationWindow,
} from './browser-notification.type';
import { BrowserNotificationSession } from './browser-notification-session';

/**
 * Display non-persistent system notifications from the current page.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Notification
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API
 */
export class BrowserNotification extends AbstractBrowserUtils {
  static override isSupported(): boolean {
    requireBrowserEnv();
    return window.isSecureContext !== false && isType('function', window, 'Notification');
  }

  private static get notification(): BrowserNotificationWindow['Notification'] | undefined {
    if (!this.isSupported()) {
      return undefined;
    }

    return (window as unknown as BrowserNotificationWindow).Notification;
  }

  static async getPermission(): Promise<BrowserNotificationPermission> {
    const state = await BrowserPermission.getState('notifications');
    if (state !== 'unsupported') {
      return state;
    }

    const permission = this.notification?.permission;
    if (permission === 'granted' || permission === 'denied') {
      return permission;
    }

    if (permission === 'default') {
      return 'prompt';
    }

    return 'unsupported';
  }

  static async requestPermission(): Promise<BrowserNotificationPermission> {
    const permission = await BrowserPermission.request('notifications');
    if (permission !== 'unsupported') {
      return permission;
    }

    const notification = this.notification;
    if (!notification) {
      return 'unsupported';
    }

    try {
      const result = await notification.requestPermission();
      if (result === 'granted' || result === 'denied') {
        return result;
      }

      return 'prompt';
    } catch {
      return this.getPermission();
    }
  }

  static getMaxActions(): number | undefined {
    return this.notification?.maxActions;
  }

  static show(
    title: string,
    options?: BrowserNotificationOptions,
  ): BrowserNotificationSession | undefined {
    const notification = this.notification;
    if (!notification || notification.permission !== 'granted') {
      return undefined;
    }

    try {
      return new BrowserNotificationSession(new notification(title, options));
    } catch {
      return undefined;
    }
  }
}
