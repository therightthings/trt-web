import { checkCircularReferences, requireBrowserEnv } from '../../utils';

export class LocalStorage {
  private static stringify(value: unknown): string {
    checkCircularReferences(value);

    return JSON.stringify(value);
  }

  private static isQuotaError(err: unknown): boolean {
    return (
      err instanceof DOMException &&
      ['QuotaExceededError', 'NS_ERROR_DOM_QUOTA_REACHED'].includes(err.name)
    );
  }

  private static isAvailable(): boolean {
    requireBrowserEnv();

    if (!window.localStorage) {
      console.error('localStorage unsupported for this environment.');
      return false;
    }

    return true;
  }

  static set<T = any>(key: string, data: T): void {
    if (!this.isAvailable()) {
      return;
    }

    try {
      const value = this.stringify(data);
      localStorage.setItem(key, value);
    } catch (err) {
      if (this.isQuotaError(err)) {
        console.error('localStorage full.');
      } else {
        console.error('localStorage setItem error', err);
      }
    }
  }

  static get<T>(key: string): T | undefined {
    if (!this.isAvailable()) {
      return undefined;
    }

    const raw = localStorage.getItem(key);
    if (!raw) {
      return undefined;
    }

    try {
      const data = JSON.parse(raw) as T;
      return data;
    } catch {
      return undefined;
    }
  }

  static remove(key: string): void {
    if (!this.isAvailable()) {
      return;
    }
    localStorage.removeItem(key);
  }

  static clear(): void {
    if (!this.isAvailable()) {
      return;
    }
    localStorage.clear();
  }

  static exists(key: string): boolean {
    if (!this.isAvailable()) {
      return false;
    }
    return localStorage.getItem(key) !== null;
  }
}
