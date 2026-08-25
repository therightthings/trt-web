// Run: npx vitest run projects/core/src/lib/browser/notification/browser-notification.spec.ts
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BrowserPermission } from '../permission/browser-permission';
import { BrowserNotification } from './browser-notification';

const createNotificationConstructor = () => {
  class NotificationMock extends EventTarget {
    static permission: NotificationPermission = 'default';
    static maxActions = 2;
    static requestPermission = vi.fn(async (): Promise<NotificationPermission> => {
      NotificationMock.permission = 'granted';
      return NotificationMock.permission;
    });

    constructor(
      readonly title: string,
      readonly options?: NotificationOptions,
    ) {
      super();
    }

    close = vi.fn();
  }

  return NotificationMock;
};

describe('BrowserNotification', () => {
  beforeEach(() => {
    vi.stubGlobal('document', {});
  });

  it('returns false when Notification is unavailable', async () => {
    vi.stubGlobal('window', { isSecureContext: true });

    expect(BrowserNotification.isSupported()).toBe(false);
    await expect(BrowserNotification.getPermission()).resolves.toBe('unsupported');
  });

  it('reads and requests notification permission', async () => {
    const NotificationMock = createNotificationConstructor();
    vi.stubGlobal('window', { Notification: NotificationMock, isSecureContext: true });

    expect(BrowserNotification.isSupported()).toBe(true);
    vi.spyOn(BrowserPermission, 'getState').mockResolvedValue('prompt');
    vi.spyOn(BrowserPermission, 'request').mockResolvedValue('granted');

    await expect(BrowserNotification.getPermission()).resolves.toBe('prompt');
    await expect(BrowserNotification.requestPermission()).resolves.toBe('granted');
    expect(BrowserPermission.getState).toHaveBeenCalledWith('notifications');
    expect(BrowserPermission.request).toHaveBeenCalledWith('notifications');
  });

  it('falls back to the native notification permission when Permissions API is unavailable', async () => {
    const NotificationMock = createNotificationConstructor();
    NotificationMock.permission = 'default';
    vi.stubGlobal('window', { Notification: NotificationMock, isSecureContext: true });
    vi.spyOn(BrowserPermission, 'getState').mockResolvedValue('unsupported');
    vi.spyOn(BrowserPermission, 'request').mockResolvedValue('unsupported');

    await expect(BrowserNotification.getPermission()).resolves.toBe('prompt');
    await expect(BrowserNotification.requestPermission()).resolves.toBe('granted');
    expect(NotificationMock.requestPermission).toHaveBeenCalledOnce();
  });

  it('returns the maximum number of supported notification actions', () => {
    const NotificationMock = createNotificationConstructor();
    vi.stubGlobal('window', { Notification: NotificationMock, isSecureContext: true });

    expect(BrowserNotification.getMaxActions()).toBe(2);
  });

  it('creates a notification when permission is granted', () => {
    const NotificationMock = createNotificationConstructor();
    NotificationMock.permission = 'granted';
    vi.stubGlobal('window', { Notification: NotificationMock, isSecureContext: true });

    const notification = BrowserNotification.show('New message', {
      body: 'You have a new message.',
      tag: 'message',
    });

    expect(notification?.getInfo().content.title).toBe('New message');
    expect(notification?.getInfo().content.body).toBeUndefined();
    notification?.close();
    expect(notification?.close).toBeTypeOf('function');
  });

  it('does not create a notification without permission', () => {
    const NotificationMock = createNotificationConstructor();
    vi.stubGlobal('window', { Notification: NotificationMock, isSecureContext: true });

    expect(BrowserNotification.show('Blocked')).toBeUndefined();
  });
});
