// Run: npx vitest run projects/core/src/lib/browser/performance/browser-performance.spec.ts
import { afterEach, describe, expect, it, vi } from 'vitest';

import { BrowserPerformance } from './browser-performance';

function createPerformance(): Performance {
  const entries: PerformanceEntry[] = [];
  return {
    clearMarks: vi.fn(),
    clearMeasures: vi.fn(),
    clearResourceTimings: vi.fn(),
    getEntries: vi.fn(() => entries),
    getEntriesByName: vi.fn((name: string) => entries.filter((entry) => entry.name === name)),
    getEntriesByType: vi.fn((type: string) => {
      return entries.filter((entry) => entry.entryType === type);
    }),
    mark: vi.fn((name: string) => {
      const mark = {
        duration: 0,
        entryType: 'mark',
        name,
        startTime: 0,
        toJSON: () => ({}),
      } as PerformanceMark;
      entries.push(mark);
      return mark;
    }),
    measure: vi.fn((name: string) => {
      const measure = {
        duration: 12,
        entryType: 'measure',
        name,
        startTime: 0,
        toJSON: () => ({}),
      } as PerformanceMeasure;
      entries.push(measure);
      return measure;
    }),
    now: vi.fn(() => 42),
    setResourceTimingBufferSize: vi.fn(),
    timeOrigin: 0,
    toJSON: vi.fn(() => ({ timeOrigin: 0 })),
  } as unknown as Performance;
}

describe('BrowserPerformance', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('requires a browser environment', () => {
    expect(() => BrowserPerformance.isSupported()).toThrow(
      'This function can only be used in a browser environment.',
    );
  });

  it('supports marks, measures, entries, and cleanup', () => {
    const performance = createPerformance();
    vi.stubGlobal('window', { performance });
    vi.stubGlobal('document', {});

    expect(BrowserPerformance.isSupported()).toBe(true);
    expect(BrowserPerformance.now()).toBe(42);
    expect(BrowserPerformance.mark('start')).toBe(true);
    expect(BrowserPerformance.measure('task', 'start')).toMatchObject({ duration: 12 });
    expect(BrowserPerformance.getEntries()).toHaveLength(2);
    expect(BrowserPerformance.getEntries({ name: 'start' })).toHaveLength(1);
    expect(BrowserPerformance.getEntries({ type: 'mark' })).toHaveLength(1);

    BrowserPerformance.clearMarks('start');
    BrowserPerformance.clearMeasures('task');
    expect(performance.clearMarks).toHaveBeenCalledWith('start');
    expect(performance.clearMeasures).toHaveBeenCalledWith('task');
  });

  it('measures sync and async tasks and cleans temporary entries', async () => {
    const performance = createPerformance();
    vi.stubGlobal('window', { performance });
    vi.stubGlobal('document', {});

    const result = await BrowserPerformance.measureAsync('load-data', async () => {
      return 'done';
    });

    expect(result).toMatchObject({ value: 'done', measure: { duration: 12 } });
    expect(performance.clearMarks).toHaveBeenCalled();
    expect(performance.clearMeasures).toHaveBeenCalledWith('load-data');
  });

  it('returns navigation and resource timing entries', () => {
    const navigation = { entryType: 'navigation' } as PerformanceNavigationTiming;
    const resource = { entryType: 'resource' } as PerformanceResourceTiming;
    const performance = createPerformance();
    vi.stubGlobal('window', {
      performance: {
        ...performance,
        getEntriesByType: vi.fn((type: string) => {
          return type === 'navigation' ? [navigation] : [resource];
        }),
      },
    });
    vi.stubGlobal('document', {});

    expect(BrowserPerformance.getNavigationTiming()).toBe(navigation);
    expect(BrowserPerformance.getResourceTiming()).toEqual([resource]);
  });

  it('creates a session that exposes the native performance API', () => {
    const performance = createPerformance();
    vi.stubGlobal('window', { performance });
    vi.stubGlobal('document', {});

    const session = BrowserPerformance.createSession();

    expect(session).toBeDefined();
    expect(session?.getNative()).toBe(performance);
    expect(session?.now()).toBe(42);
    expect(session?.mark('session-start')).toBeDefined();
    expect(session?.measure('session-task', 'session-start')).toBeDefined();
    expect(session?.getEntriesByType('mark')).toHaveLength(1);
    expect(session?.getNavigationTiming()).toBeUndefined();
    expect(session?.getResourceTiming()).toEqual([]);
    expect(session?.analyzePage()).toMatchObject({
      eventCounts: {},
      resources: [],
      timeOrigin: expect.any(Number),
    });
    session?.clearResourceTimings();
    session?.setResourceTimingBufferSize(100);
    expect(session?.toJSON()).toEqual({ timeOrigin: 0 });
    expect(performance.clearResourceTimings).toHaveBeenCalled();
    expect(performance.setResourceTimingBufferSize).toHaveBeenCalledWith(100);
  });
});
