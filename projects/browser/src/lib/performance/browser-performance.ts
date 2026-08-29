import { isType, requireBrowserEnv } from '@trt-web/core';

import { AbstractBrowserUtils } from '../browser.type';
import type {
  BrowserPerformanceEntriesOptions,
  BrowserPerformanceMeasureResult,
  BrowserPerformanceNavigationTiming,
} from './browser-performance.type';
import { BrowserPerformanceSession } from './browser-performance-session';

/**
 * Measure browser-side work with the Performance API.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Performance
 * @see https://developer.mozilla.org/en-US/docs/Web/API/User_Timing_API
 */
export class BrowserPerformance extends AbstractBrowserUtils {
  private static sequence = 0;

  static override isSupported(): boolean {
    requireBrowserEnv();
    return isType('object', window, 'performance');
  }

  private static get performance(): Performance | undefined {
    if (!this.isSupported()) {
      return undefined;
    }

    return window.performance;
  }

  static createSession(): BrowserPerformanceSession | undefined {
    const performance = this.performance;
    return performance ? new BrowserPerformanceSession(performance) : undefined;
  }

  static now(): number | undefined {
    return this.createSession()?.now();
  }

  static mark(name: string): boolean {
    const session = this.createSession();
    if (!session) {
      return false;
    }

    return Boolean(session.mark(name));
  }

  static measure(
    name: string,
    startMark?: string,
    endMark?: string,
  ): PerformanceMeasure | undefined {
    return this.createSession()?.measure(name, startMark, endMark);
  }

  static async measureAsync<T>(
    name: string,
    task: () => Promise<T> | T,
  ): Promise<BrowserPerformanceMeasureResult<T> | undefined> {
    const session = this.createSession();
    if (!session) {
      return undefined;
    }

    const id = ++this.sequence;
    const startMark = `browser-performance:${name}:start:${id}`;
    const endMark = `browser-performance:${name}:end:${id}`;

    session.mark(startMark);
    try {
      const value = await task();
      session.mark(endMark);
      const measure = session.measure(name, startMark, endMark);
      return measure ? { measure, value } : undefined;
    } finally {
      session.clearMarks(startMark);
      session.clearMarks(endMark);
      session.clearMeasures(name);
    }
  }

  static getEntries(options?: BrowserPerformanceEntriesOptions): PerformanceEntry[] {
    const performance = this.createSession();
    return performance?.getEntries(options) ?? [];
  }

  static getNavigationTiming(): BrowserPerformanceNavigationTiming | undefined {
    return this.createSession()?.getNavigationTiming();
  }

  static getResourceTiming(): PerformanceResourceTiming[] {
    return this.createSession()?.getResourceTiming() ?? [];
  }

  static clearMarks(name?: string): void {
    this.createSession()?.clearMarks(name);
  }

  static clearMeasures(name?: string): void {
    this.createSession()?.clearMeasures(name);
  }
}
