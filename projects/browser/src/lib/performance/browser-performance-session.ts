import type {
  BrowserPerformanceEntriesOptions,
  BrowserPerformanceMemory,
  BrowserPerformanceMemoryMeasurement,
  BrowserPerformanceNative,
  BrowserPerformanceNavigationTiming,
  BrowserPerformancePageAnalysis,
} from './browser-performance.type';

/**
 * Session wrapper for the native Performance interface.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Performance
 */
export class BrowserPerformanceSession {
  constructor(private readonly performance: BrowserPerformanceNative) {}

  get eventCounts(): Record<string, number> {
    return this.performance.eventCounts
      ? Object.fromEntries(this.performance.eventCounts.entries())
      : {};
  }

  get interactionCount(): number | undefined {
    return this.performance.interactionCount;
  }

  get memory(): BrowserPerformanceMemory | undefined {
    const memory = this.performance.memory;
    if (!memory) {
      return undefined;
    }

    return {
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      totalJSHeapSize: memory.totalJSHeapSize,
      usedJSHeapSize: memory.usedJSHeapSize,
    };
  }

  get timeOrigin(): number {
    return this.performance.timeOrigin;
  }

  getNative(): Performance {
    return this.performance;
  }

  clearMarks(name?: string): void {
    this.performance.clearMarks(name);
  }

  clearMeasures(name?: string): void {
    this.performance.clearMeasures(name);
  }

  clearResourceTimings(): void {
    this.performance.clearResourceTimings();
  }

  getEntries(options?: BrowserPerformanceEntriesOptions): PerformanceEntry[] {
    const { name, type } = options ?? {};
    if (type) {
      return this.getEntriesByType(type);
    }

    if (name) {
      return this.getEntriesByName(name);
    }

    return this.performance.getEntries();
  }

  getEntriesByName(name: string, type?: string): PerformanceEntry[] {
    return this.performance.getEntriesByName(name, type);
  }

  getEntriesByType(type: string): PerformanceEntry[] {
    return this.performance.getEntriesByType(type);
  }

  getNavigationTiming(): BrowserPerformanceNavigationTiming | undefined {
    return this.getEntriesByType('navigation').find(
      (entry): entry is BrowserPerformanceNavigationTiming => entry.entryType === 'navigation',
    );
  }

  getResourceTiming(): PerformanceResourceTiming[] {
    return this.getEntriesByType('resource').filter(
      (entry): entry is PerformanceResourceTiming => entry.entryType === 'resource',
    );
  }

  analyzePage(): BrowserPerformancePageAnalysis {
    const navigation = this.getNavigationTiming();
    const navigationInfo = navigation
      ? {
          name: navigation.name,
          duration: navigation.duration,
          startTime: navigation.startTime,
          domInteractive: navigation.domInteractive,
          domContentLoadedEventEnd: navigation.domContentLoadedEventEnd,
          loadEventEnd: navigation.loadEventEnd,
          transferSize: navigation.transferSize,
          encodedBodySize: navigation.encodedBodySize,
          decodedBodySize: navigation.decodedBodySize,
          deliveryType: navigation.deliveryType ?? '',
          responseStatus: navigation.responseStatus,
        }
      : undefined;

    return {
      eventCounts: this.eventCounts,
      interactionCount: this.interactionCount,
      memory: this.memory,
      navigation: navigationInfo,
      resources: this.getResourceTiming().map((resource) => {
        const extendedResource = resource as PerformanceResourceTiming & {
          deliveryType?: string;
          renderBlockingStatus?: string;
        };

        return {
          name: resource.name,
          duration: resource.duration,
          startTime: resource.startTime,
          initiatorType: resource.initiatorType,
          transferSize: resource.transferSize,
          encodedBodySize: resource.encodedBodySize,
          decodedBodySize: resource.decodedBodySize,
          deliveryType: extendedResource.deliveryType ?? '',
          renderBlockingStatus: extendedResource.renderBlockingStatus ?? '',
        };
      }),
      timeOrigin: this.timeOrigin,
    };
  }

  mark(name: string): PerformanceMark | undefined {
    try {
      return this.performance.mark(name);
    } catch {
      return undefined;
    }
  }

  measure(name: string, startMark?: string, endMark?: string): PerformanceMeasure | undefined {
    try {
      return this.performance.measure(name, startMark, endMark);
    } catch {
      return undefined;
    }
  }

  measureUserAgentSpecificMemory(): Promise<BrowserPerformanceMemoryMeasurement | undefined> {
    if (!this.performance.measureUserAgentSpecificMemory) {
      return Promise.resolve(undefined);
    }

    return this.performance.measureUserAgentSpecificMemory();
  }

  now(): number {
    return this.performance.now();
  }

  setResourceTimingBufferSize(maxSize: number): void {
    this.performance.setResourceTimingBufferSize(maxSize);
  }

  toJSON(): Record<string, unknown> {
    return this.performance.toJSON() as Record<string, unknown>;
  }

  addEventListener(
    type: 'resourcetimingbufferfull',
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): void {
    this.performance.addEventListener(type, listener, options);
  }

  removeEventListener(
    type: 'resourcetimingbufferfull',
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ): void {
    this.performance.removeEventListener(type, listener, options);
  }
}
