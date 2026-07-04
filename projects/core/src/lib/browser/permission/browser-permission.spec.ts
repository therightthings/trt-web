// Run: npx vitest run projects/core/src/lib/browser/permission/browser-permission.spec.ts
import { afterEach, describe, expect, it, vi } from 'vitest';

import { BrowserPermission } from './browser-permission';

function stubBrowserGlobals(overrides?: {
  navigator?: Record<string, unknown>;
  window?: Record<string, unknown>;
  document?: Record<string, unknown>;
  notification?: Record<string, unknown>;
}) {
  const permissions = {
    query: vi.fn(),
  };
  const geolocation = {
    getCurrentPosition: vi.fn(),
  };
  const mediaDevices = {
    getUserMedia: vi.fn(),
  };
  const clipboard = {
    readText: vi.fn(),
  };
  const storage = {
    persist: vi.fn(),
  };
  const serviceWorker = {
    getRegistration: vi.fn(),
  };
  const wakeLock = {
    request: vi.fn(),
  };
  const navigator = {
    permissions,
    geolocation,
    mediaDevices,
    clipboard,
    storage,
    requestMIDIAccess: vi.fn(),
    serviceWorker,
    wakeLock,
    share: vi.fn(),
    canShare: vi.fn(),
    ...overrides?.navigator,
  } as Record<string, unknown>;
  const notification = {
    requestPermission: vi.fn(),
    ...overrides?.notification,
  } as Record<string, unknown>;
  const window = {
    Notification: notification,
    ...overrides?.window,
  } as Record<string, unknown>;
  const document = {
    requestStorageAccess: vi.fn(),
    ...overrides?.document,
  } as Record<string, unknown>;

  vi.stubGlobal('navigator', navigator);
  vi.stubGlobal('window', window);
  vi.stubGlobal('document', document);
  vi.stubGlobal('Notification', notification);

  return {
    permissions,
    geolocation,
    mediaDevices,
    clipboard,
    storage,
    serviceWorker,
    wakeLock,
    navigator,
    window,
    document,
    notification,
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('BrowserPermission', () => {
  it('returns unsupported when browser globals are missing', async () => {
    await expect(BrowserPermission.getState('geolocation')).resolves.toBe('unsupported');
    await expect(BrowserPermission.request('geolocation')).resolves.toBe('unsupported');
  });

  it('queries the permissions API for normal permissions', async () => {
    const { permissions } = stubBrowserGlobals();
    permissions.query.mockResolvedValue({ state: 'granted' });

    await expect(BrowserPermission.getState('geolocation')).resolves.toBe('granted');
    expect(permissions.query).toHaveBeenCalledWith({ name: 'geolocation' });
  });

  it('requests geolocation and resolves granted', async () => {
    const { geolocation } = stubBrowserGlobals();
    geolocation.getCurrentPosition.mockImplementation((success: () => void) => success());

    await expect(BrowserPermission.request('geolocation')).resolves.toBe('granted');
  });

  it('requests geolocation and resolves denied when the browser denies access', async () => {
    const { geolocation } = stubBrowserGlobals();
    geolocation.getCurrentPosition.mockImplementation(
      (_success: () => void, failure: (err: { code: number; PERMISSION_DENIED: number }) => void) =>
        failure({ code: 1, PERMISSION_DENIED: 1 }),
    );

    await expect(BrowserPermission.request('geolocation')).resolves.toBe('denied');
  });

  it('maps default notification permission to prompt', async () => {
    const { notification } = stubBrowserGlobals();
    (notification['requestPermission'] as ReturnType<typeof vi.fn>).mockResolvedValue('default');

    await expect(BrowserPermission.request('notifications')).resolves.toBe('prompt');
  });

  it('reads push permission state from the service worker registration', async () => {
    const { serviceWorker } = stubBrowserGlobals();
    const registration = {
      pushManager: {
        permissionState: vi.fn().mockResolvedValue('granted'),
      },
    };
    (serviceWorker['getRegistration'] as ReturnType<typeof vi.fn>).mockResolvedValue(registration);

    await expect(BrowserPermission.getState('push')).resolves.toBe('granted');
    expect(registration.pushManager.permissionState).toHaveBeenCalledWith({
      userVisibleOnly: true,
    });
  });

  it('treats shared permissions as denied when sharing is not available for the payload', async () => {
    const { navigator } = stubBrowserGlobals({
      navigator: {
        canShare: vi.fn(() => false),
      },
    });

    expect((navigator as any).canShare).toBeDefined();
    await expect(BrowserPermission.getState('shared')).resolves.toBe('denied');
  });

  it('requests clipboard read and denies on failure', async () => {
    const { clipboard } = stubBrowserGlobals();
    vi.mocked(clipboard.readText).mockRejectedValue(new Error('blocked'));

    await expect(BrowserPermission.request('clipboard-read')).resolves.toBe('denied');
  });
});
