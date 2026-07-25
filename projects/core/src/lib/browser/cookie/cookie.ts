import type { TimeConfig } from '../../utils';
import { requireBrowserEnv, stringify, toMs } from '../../utils';

export interface CookieSetConfig {
  expiresIn?: number | TimeConfig;
  path?: string;
}

export class Cookie {
  private static readonly cookiePaths = new Map<string, string>();

  private static decodeCookieComponent(value: string): string {
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }

  private static createCookieExpiration(expiresIn: number | TimeConfig): string {
    const expiresAt = new Date();
    expiresAt.setTime(expiresAt.getTime() + toMs(expiresIn));

    return expiresAt.toUTCString();
  }

  private static parseCookieEntries(): Map<string, string> {
    const entries = new Map<string, string>();
    const rawCookies = document.cookie ? document.cookie.split(';') : [];

    for (const rawCookie of rawCookies) {
      const cookie = rawCookie.trim();
      if (!cookie) continue;

      const separatorIndex = cookie.indexOf('=');
      if (separatorIndex === -1) continue;

      const name = this.decodeCookieComponent(cookie.slice(0, separatorIndex).trim());
      const value = cookie.slice(separatorIndex + 1).trim();
      entries.set(name, value);
    }

    return entries;
  }

  private static isAvailable(): boolean {
    requireBrowserEnv();

    if (!navigator.cookieEnabled) {
      console.error('cookie unsupported for this environment.');
      return false;
    }

    return true;
  }

  private static writeCookie(
    key: string,
    value: string,
    config?: CookieSetConfig,
    expires?: string,
  ): void {
    const parts = [`${encodeURIComponent(key)}=${encodeURIComponent(value)}`];

    if (expires) {
      parts.push(`expires=${expires}`);
    } else if (typeof config?.expiresIn === 'number' || config?.expiresIn != null) {
      parts.push(`expires=${this.createCookieExpiration(config.expiresIn)}`);
    }

    parts.push(`path=${config?.path ?? '/'}`);

    document.cookie = parts.join('; ');
  }

  static isSupported(): boolean {
    return this.isAvailable();
  }

  static set<T = any>(key: string, data: T, config?: CookieSetConfig): void {
    if (!this.isAvailable()) {
      return;
    }

    try {
      this.writeCookie(key, stringify(data), config);
      this.cookiePaths.set(key, config?.path ?? '/');
    } catch (err) {
      console.error('cookie setItem error', err);
    }
  }

  static get<T>(key: string): T | undefined {
    if (!this.isAvailable()) {
      return undefined;
    }

    const raw = this.parseCookieEntries().get(key);
    if (!raw) {
      return undefined;
    }

    try {
      const data = JSON.parse(this.decodeCookieComponent(raw)) as T;
      return data;
    } catch {
      return undefined;
    }
  }

  static remove(key: string, config?: CookieSetConfig): void {
    if (!this.isAvailable()) {
      return;
    }

    const path = config?.path ?? this.cookiePaths.get(key) ?? '/';

    this.writeCookie(key, '', { ...config, path }, 'Thu, 01 Jan 1970 00:00:00 GMT');

    this.cookiePaths.delete(key);
  }

  static clear(): void {
    if (!this.isAvailable()) {
      return;
    }

    for (const key of Array.from(this.parseCookieEntries().keys())) {
      this.remove(key);
    }
  }

  static exists(key: string): boolean {
    if (!this.isAvailable()) {
      return false;
    }

    return this.parseCookieEntries().has(key);
  }

  private static setCookie<T = any>(
    name: string,
    value: T,
    expiresIn: number | TimeConfig = 365,
  ): void {
    this.set(name, value, { expiresIn });
  }

  private static getCookie<T>(name: string): T | undefined {
    return this.get<T>(name);
  }
}
