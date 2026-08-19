import { convertFileSize } from '../../file-handler';
import { requireBrowserEnv } from '../../utils';

export type BrowserInformationScope = 'all' | 'hardware' | 'battery' | 'environment' | 'screen';

export type BrowserInformationConfig = {
  scope?: BrowserInformationScope;
};

export type EnvironmentInfo = {
  locale: string;
  preferredLanguages: string[];
  os: 'macOS' | 'Windows' | 'Linux' | 'iOS' | 'Android' | 'Unknown';
  browser: 'Chrome' | 'Edge' | 'Safari' | 'Firefox' | 'Unknown';
  browserVersion?: number;
  engine: 'Chromium' | 'WebKit' | 'Gecko' | 'Unknown';
  deviceType: 'desktop' | 'mobile';
};

export type BrowserHardwareInfo = {
  cores: number | null;
  memoryGB: number | null;
};

export type BrowserBatteryInfo = {
  charging: boolean;
  percent: number;
};

export type BrowserStorageHealthInfo = {
  ratio: number;
  quotaGB: number;
  persistent: boolean;
  risk: 'high' | 'medium' | 'low';
};

export type BrowserScreenInfo = {
  window: {
    innerWidth: number;
    innerHeight: number;
    outerHeight: number;
    outerWidth: number;
  };
  screen: {
    width: number;
    height: number;
    availWidth: number;
    availHeight: number;
    colorDepth: number;
    pixelDepth: number;
  };
  location: {
    href: string;
    hostname: string;
    origin: string;
    host: string;
    hash: string;
    pathname: string;
    protocol: string;
  };
};

export type BrowserInformationResult =
  | {
      hardware: BrowserHardwareInfo;
      battery: BrowserBatteryInfo;
      environment: EnvironmentInfo;
      storageHealth: BrowserStorageHealthInfo;
      screenInfo: BrowserScreenInfo;
    }
  | { hardware: BrowserHardwareInfo }
  | { battery: BrowserBatteryInfo }
  | { environment: EnvironmentInfo }
  | { screenInfo: BrowserScreenInfo };

type BrowserBatteryManager = {
  readonly charging: boolean;
  readonly chargingTime: number;
  readonly dischargingTime: number;
  readonly level: number;
};

/**
 * Browser environment and device information helpers.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Navigator
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Screen
 */
export class BrowserEnvironment {
  static getLocale(): string {
    requireBrowserEnv();

    let lang = navigator.language || 'en';

    if (Array.isArray(navigator.languages) && navigator.languages.length) {
      lang = navigator.languages[0];
    }

    return lang.split('-')[0];
  }

  static async getInformation(
    config?: BrowserInformationConfig,
  ): Promise<BrowserInformationResult> {
    requireBrowserEnv();

    const { scope = 'all' } = config ?? {};

    switch (scope) {
      case 'hardware': {
        return {
          hardware: this.getHardwareInfo(),
        };
      }

      case 'battery': {
        return {
          battery: await this.getBatteryInfoStat(),
        };
      }

      case 'environment': {
        return {
          environment: this.getEnvironmentInfo(),
        };
      }

      case 'screen': {
        return {
          screenInfo: this.screenInfo(),
        };
      }

      case 'all':
      default: {
        const hardware = this.getHardwareInfo();
        const battery = await this.getBatteryInfoStat();
        const environment = this.getEnvironmentInfo();
        const storageHealth = await this.getStorageHealth();
        const screenInfo = this.screenInfo();

        return {
          hardware,
          battery,
          environment,
          storageHealth,
          screenInfo,
        };
      }
    }
  }

  private static screenInfo(): BrowserScreenInfo {
    requireBrowserEnv();

    const { screen, location } = window;

    return {
      window: {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        outerHeight: window.outerHeight,
        outerWidth: window.outerWidth,
      },
      screen: {
        width: screen.width,
        height: screen.height,
        availWidth: screen.availWidth,
        availHeight: screen.availHeight,
        colorDepth: screen.colorDepth,
        pixelDepth: screen.pixelDepth,
      },
      location: {
        href: location.href,
        hostname: location.hostname,
        origin: location.origin,
        host: location.host,
        hash: location.hash,
        pathname: location.pathname,
        protocol: location.protocol,
      },
    };
  }

  private static getHardwareInfo(): BrowserHardwareInfo {
    requireBrowserEnv();

    return {
      cores: navigator.hardwareConcurrency ?? null,
      memoryGB: (navigator as any).deviceMemory ?? null,
    };
  }

  private static async getBatteryInfoStat(): Promise<BrowserBatteryInfo> {
    const battery = await this.getBatteryInfo();
    const { level = 0, charging = false } = battery ?? {};

    return {
      charging: charging,
      percent: level <= 1 ? Math.round(level * 100) : level,
    };
  }

  private static async getBatteryInfo(): Promise<BrowserBatteryManager | null> {
    requireBrowserEnv();

    if (typeof navigator === 'undefined') return null;
    if (!('getBattery' in navigator)) return null;
    if (typeof navigator.getBattery !== 'function') return null;

    const battery: BrowserBatteryManager = await navigator.getBattery();

    return battery;
  }

  private static async getStorageHealth(): Promise<BrowserStorageHealthInfo> {
    const estimate = await this.getStorageEstimate();
    const persisted = await this.isPersistentStorageGranted();
    const usage = estimate?.usage ?? 0;
    const quota = estimate?.quota ?? 1;
    const quotaGB = convertFileSize(quota, `byte:Gb`);
    const ratio = usage / quota;
    const persistent = !!persisted;
    let risk: BrowserStorageHealthInfo['risk'] = 'low';

    if (!persistent) {
      risk = 'high';
    } else if (ratio > 0.8) {
      risk = 'high';
    } else if (ratio > 0.6) {
      risk = 'medium';
    }

    return {
      ratio,
      quotaGB,
      persistent,
      risk,
    };
  }

  private static async getStorageEstimate() {
    requireBrowserEnv();

    if (typeof navigator === 'undefined') return null;
    if (!('storage' in navigator)) return null;

    return navigator.storage.estimate();
  }

  private static async isPersistentStorageGranted(): Promise<boolean> {
    if (typeof navigator === 'undefined') return false;
    if (!navigator.storage?.persisted) return false;

    return navigator.storage.persisted();
  }

  private static getEnvironmentInfo(): EnvironmentInfo {
    requireBrowserEnv();

    const uaData = (navigator as any).userAgentData;
    const ua = navigator.userAgent;

    let browser: EnvironmentInfo['browser'] = 'Unknown';
    let engine: EnvironmentInfo['engine'] = 'Unknown';
    let browserVersion: number | undefined;

    if (uaData?.brands?.length) {
      if (uaData.brands.some((b: any) => b.brand === 'Google Chrome')) {
        browser = 'Chrome';
        engine = 'Chromium';
        browserVersion = Number(
          uaData.brands.find((b: any) => b.brand === 'Google Chrome')?.version,
        );
      }
    }

    if (browser === 'Unknown') {
      const safari = this.detectFromUserAgent(ua);

      if (safari) {
        browser = safari.browser;
        engine = safari.engine;
        browserVersion = safari.browserVersion;
      }
    }

    return {
      locale: navigator.language,
      preferredLanguages: (navigator.languages ?? [navigator.language]) as string[],
      os: this.detectOS(),
      browser,
      browserVersion,
      engine,
      deviceType: uaData?.mobile ? 'mobile' : 'desktop',
    };
  }

  private static detectFromUserAgent(ua: string) {
    const isSafari = ua.includes('Safari') && !ua.includes('Chrome') && !ua.includes('Chromium');

    if (!isSafari) return null;

    const versionMatch = ua.match(/Version\/(\d+)/);

    return {
      browser: 'Safari' as const,
      engine: 'WebKit' as const,
      browserVersion: versionMatch ? Number(versionMatch[1]) : undefined,
    };
  }

  private static detectOS(): EnvironmentInfo['os'] {
    if (typeof navigator === 'undefined') return 'Unknown';

    const uaData = (navigator as any).userAgentData;
    const platform = uaData?.platform ?? navigator.platform;

    if (!platform) return 'Unknown';

    if (/mac/i.test(platform)) return 'macOS';
    if (/win/i.test(platform)) return 'Windows';
    if (/linux/i.test(platform)) return 'Linux';
    if (/iphone|ipad|ios/i.test(platform)) return 'iOS';
    if (/android/i.test(platform)) return 'Android';

    return 'Unknown';
  }
}
