// Run: npx vitest run projects/core/src/lib/browser/environment/browser-environment.spec.ts
import { afterEach, describe, expect, it, vi } from 'vitest';

import { BrowserEnvironment } from './browser-environment';

function stubBrowserShell(overrides?: {
  navigator?: Record<string, unknown>;
  window?: Record<string, unknown>;
}) {
  const navigator = {
    language: 'en-US',
    languages: ['en-US', 'vi-VN'],
    hardwareConcurrency: 8,
    deviceMemory: 16,
    maxTouchPoints: 2,
    userActivation: { hasBeenActive: true, isActive: true },
    getBattery: vi.fn().mockResolvedValue({ level: 0.5, charging: true }),
    storage: {
      estimate: vi.fn().mockResolvedValue({ usage: 512, quota: 1024 }),
      persisted: vi.fn().mockResolvedValue(true),
    },
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
    platform: 'MacIntel',
    userAgentData: {
      brands: [{ brand: 'Safari', version: '17' }],
      mobile: false,
      platform: 'macOS',
    },
    ...overrides?.navigator,
  } as Record<string, unknown>;

  const window = {
    innerWidth: 1280,
    innerHeight: 720,
    outerWidth: 1440,
    outerHeight: 900,
    screen: {
      width: 1440,
      height: 900,
      availWidth: 1400,
      availHeight: 860,
      colorDepth: 24,
      pixelDepth: 24,
    },
    location: {
      href: 'https://example.com/app',
      hostname: 'example.com',
      origin: 'https://example.com',
      host: 'example.com',
      hash: '#hash',
      pathname: '/app',
      protocol: 'https:',
    },
    document: {},
    ...overrides?.window,
  } as Record<string, unknown>;

  vi.stubGlobal('navigator', navigator);
  vi.stubGlobal('window', window);
  vi.stubGlobal('document', {
    baseURI: 'https://example.com/app/',
  });

  return { navigator, window };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('BrowserEnvironment', () => {
  it('returns only hardware info for hardware scope', async () => {
    stubBrowserShell();

    await expect(BrowserEnvironment.getInformation({ scope: 'hardware' })).resolves.toEqual({
      hardware: {
        cores: 8,
        memoryGB: 16,
      },
    });
  });

  it('returns only battery info for battery scope', async () => {
    const { navigator } = stubBrowserShell();

    await expect(BrowserEnvironment.getInformation({ scope: 'battery' })).resolves.toEqual({
      battery: {
        charging: true,
        percent: 50,
      },
    });
    expect(navigator['getBattery'] as ReturnType<typeof vi.fn>).toHaveBeenCalledTimes(1);
  });

  it('returns only environment info for environment scope', async () => {
    stubBrowserShell();

    await expect(BrowserEnvironment.getInformation({ scope: 'environment' })).resolves.toEqual({
      environment: {
        locale: 'en-US',
        preferredLanguages: ['en-US', 'vi-VN'],
        os: 'macOS',
        browser: 'Safari',
        browserVersion: 17,
        engine: 'WebKit',
        deviceType: 'desktop',
      },
    });
  });

  it('returns only screen info for screen scope', async () => {
    stubBrowserShell();

    await expect(BrowserEnvironment.getInformation({ scope: 'screen' })).resolves.toEqual({
      screenInfo: {
        window: {
          innerWidth: 1280,
          innerHeight: 720,
          outerHeight: 900,
          outerWidth: 1440,
        },
        screen: {
          width: 1440,
          height: 900,
          availWidth: 1400,
          availHeight: 860,
          colorDepth: 24,
          pixelDepth: 24,
        },
        location: {
          href: 'https://example.com/app',
          hostname: 'example.com',
          origin: 'https://example.com',
          host: 'example.com',
          hash: '#hash',
          pathname: '/app',
          protocol: 'https:',
        },
      },
    });
  });

  it('returns the full payload for all scope', async () => {
    stubBrowserShell();

    await expect(BrowserEnvironment.getInformation({ scope: 'all' })).resolves.toEqual({
      hardware: {
        cores: 8,
        memoryGB: 16,
      },
      battery: {
        charging: true,
        percent: 50,
      },
      environment: {
        locale: 'en-US',
        preferredLanguages: ['en-US', 'vi-VN'],
        os: 'macOS',
        browser: 'Safari',
        browserVersion: 17,
        engine: 'WebKit',
        deviceType: 'desktop',
      },
      storageHealth: {
        ratio: 0.5,
        quotaGB: 0,
        persistent: true,
        risk: 'low',
      },
      screenInfo: {
        window: {
          innerWidth: 1280,
          innerHeight: 720,
          outerHeight: 900,
          outerWidth: 1440,
        },
        screen: {
          width: 1440,
          height: 900,
          availWidth: 1400,
          availHeight: 860,
          colorDepth: 24,
          pixelDepth: 24,
        },
        location: {
          href: 'https://example.com/app',
          hostname: 'example.com',
          origin: 'https://example.com',
          host: 'example.com',
          hash: '#hash',
          pathname: '/app',
          protocol: 'https:',
        },
      },
    });
  });
});
