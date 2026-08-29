import type { BrowserPermissionState } from '../permission/browser-permission.type';

export type BrowserNotificationPermission = BrowserPermissionState;

export type BrowserNotificationAction = {
  action: string;
  title: string;
  icon?: string;
};

export type BrowserNotificationOptions = NotificationOptions & {
  actions?: BrowserNotificationAction[];
  badge?: string;
  image?: string;
  navigate?: string;
  renotify?: boolean;
  timestamp?: number;
  vibrate?: number | number[];
};

export type BrowserNotificationInstance = Notification & {
  readonly actions: BrowserNotificationAction[];
  readonly badge: string;
  readonly image: string;
  readonly navigate: string;
  readonly renotify: boolean;
  readonly timestamp: number;
  readonly vibrate: number[];
};

export type BrowserNotificationInfo = {
  content: {
    title: string;
    body: string;
    data: unknown;
  };
  presentation: {
    icon: string;
    lang: string;
    dir: NotificationDirection;
    badge?: string;
    image?: string;
  };
  behavior: {
    actions?: BrowserNotificationAction[];
    navigate?: string;
    renotify?: boolean;
    requireInteraction: boolean;
    silent: boolean | null;
    tag: string;
    vibrate?: number[];
  };
  timing: {
    timestamp?: number;
  };
};

export type BrowserNotificationWindow = Window & {
  Notification?: {
    new (title: string, options?: BrowserNotificationOptions): BrowserNotificationInstance;
    permission: NotificationPermission;
    maxActions?: number;
    requestPermission(): Promise<NotificationPermission>;
  };
};
