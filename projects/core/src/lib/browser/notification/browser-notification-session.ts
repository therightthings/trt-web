import type {
  BrowserNotificationInfo,
  BrowserNotificationInstance,
} from './browser-notification.type';

/**
 * Controls one notification instance created by `BrowserNotification.show()`.
 */
export class BrowserNotificationSession {
  constructor(private readonly notification: BrowserNotificationInstance) {}

  getInfo(): BrowserNotificationInfo {
    const {
      actions,
      badge,
      body,
      data,
      dir,
      icon,
      image,
      lang,
      navigate,
      renotify,
      requireInteraction,
      silent,
      tag,
      timestamp,
      title,
      vibrate,
    } = this.notification;

    return {
      content: {
        title,
        body,
        data,
      },
      presentation: {
        icon,
        lang,
        dir,
        badge,
        image,
      },
      behavior: {
        actions,
        navigate,
        renotify,
        requireInteraction,
        silent,
        tag,
        vibrate,
      },
      timing: {
        timestamp,
      },
    };
  }

  addEventListener<K extends keyof NotificationEventMap>(
    type: K,
    listener: (this: Notification, event: NotificationEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions,
  ): void {
    this.notification.addEventListener(type, listener, options);
  }

  removeEventListener<K extends keyof NotificationEventMap>(
    type: K,
    listener: (this: Notification, event: NotificationEventMap[K]) => void,
    options?: boolean | EventListenerOptions,
  ): void {
    this.notification.removeEventListener(type, listener, options);
  }

  close(): void {
    this.notification.close();
  }
}
