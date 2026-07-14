// Run: npx vitest run projects/core/src/lib/browser/location/browser-location.spec.ts
import { afterEach, describe, expect, it, vi } from 'vitest';

import { BrowserPermission } from '../permission/browser-permission';
import { BrowserLocation } from './browser-location';

function stubBrowserShell(overrides?: {
  geolocation?: Record<string, unknown>;
  navigator?: Record<string, unknown>;
  window?: Record<string, unknown>;
}) {
  const geolocation = {
    getCurrentPosition: vi.fn(),
    ...overrides?.geolocation,
  };

  const navigator = {
    geolocation,
    ...overrides?.navigator,
  } as Record<string, unknown>;

  const window = {
    document: {},
    ...overrides?.window,
  } as Record<string, unknown>;

  vi.stubGlobal('navigator', navigator);
  vi.stubGlobal('window', window);
  vi.stubGlobal('document', {});

  return {
    geolocation,
    navigator,
    window,
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('BrowserLocation', () => {
  it('returns unsupported when geolocation permission is unsupported', async () => {
    stubBrowserShell();
    const getStateSpy = vi.spyOn(BrowserPermission, 'getState').mockResolvedValue('unsupported');
    const requestSpy = vi.spyOn(BrowserPermission, 'request');

    await expect(BrowserLocation.getLocation()).resolves.toEqual({
      permission: 'unsupported',
      success: false,
    });
    expect(getStateSpy).toHaveBeenCalledWith('geolocation');
    expect(requestSpy).not.toHaveBeenCalled();
  });

  it('gets location when permission is already granted', async () => {
    const { geolocation } = stubBrowserShell();
    const position = { coords: { latitude: 10, longitude: 20 } } as GeolocationPosition;
    const getStateSpy = vi.spyOn(BrowserPermission, 'getState').mockResolvedValue('granted');

    geolocation.getCurrentPosition.mockImplementation(
      (success: PositionCallback, _failure: PositionErrorCallback, options?: PositionOptions) => {
        expect(options).toEqual({
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        });
        success(position);
      },
    );

    await expect(BrowserLocation.getLocation()).resolves.toEqual({
      permission: 'granted',
      data: position,
      success: true,
    });
    expect(getStateSpy).toHaveBeenCalledWith('geolocation');
    expect(geolocation.getCurrentPosition).toHaveBeenCalledTimes(1);
  });

  it('requests permission when geolocation is not yet granted', async () => {
    const { geolocation } = stubBrowserShell();
    const position = { coords: { latitude: 1, longitude: 2 } } as GeolocationPosition;
    vi.spyOn(BrowserPermission, 'getState').mockResolvedValue('prompt');
    const requestSpy = vi.spyOn(BrowserPermission, 'request').mockResolvedValue('granted');

    geolocation.getCurrentPosition.mockImplementation(
      (success: PositionCallback, _failure: PositionErrorCallback) => success(position),
    );

    await expect(BrowserLocation.getLocation()).resolves.toEqual({
      permission: 'granted',
      data: position,
      success: true,
    });
    expect(requestSpy).toHaveBeenCalledWith('geolocation');
  });

  it('returns false when permission is denied after request', async () => {
    stubBrowserShell();
    vi.spyOn(BrowserPermission, 'getState').mockResolvedValue('prompt');
    vi.spyOn(BrowserPermission, 'request').mockResolvedValue('denied');

    await expect(BrowserLocation.getLocation()).resolves.toEqual({
      permission: 'denied',
      success: false,
    });
  });

  it('passes accurate speed options to geolocation', async () => {
    const { geolocation } = stubBrowserShell();
    const position = { coords: { latitude: 3, longitude: 4 } } as GeolocationPosition;
    vi.spyOn(BrowserPermission, 'getState').mockResolvedValue('granted');

    geolocation.getCurrentPosition.mockImplementation(
      (success: PositionCallback, _failure: PositionErrorCallback, options?: PositionOptions) => {
        expect(options).toEqual({
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        });
        success(position);
      },
    );

    await expect(BrowserLocation.getLocation({ speed: 'accurate' })).resolves.toEqual({
      permission: 'granted',
      data: position,
      success: true,
    });
  });

  it('passes fast speed options to geolocation', async () => {
    const { geolocation } = stubBrowserShell();
    const position = { coords: { latitude: 5, longitude: 6 } } as GeolocationPosition;
    vi.spyOn(BrowserPermission, 'getState').mockResolvedValue('granted');

    geolocation.getCurrentPosition.mockImplementation(
      (success: PositionCallback, _failure: PositionErrorCallback, options?: PositionOptions) => {
        expect(options).toEqual({
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 20000,
        });
        success(position);
      },
    );

    await expect(BrowserLocation.getLocation({ speed: 'fast' })).resolves.toEqual({
      permission: 'granted',
      data: position,
      success: true,
    });
  });
});
