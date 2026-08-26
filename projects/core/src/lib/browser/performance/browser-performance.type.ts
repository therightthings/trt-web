export type BrowserPerformanceMeasureResult<T> = {
  value: T;
  measure: PerformanceMeasure;
};

export type BrowserPerformanceEntriesOptions = {
  name?: string;
  type?: string;
};

export type BrowserPerformanceNavigationTiming = PerformanceNavigationTiming & {
  deliveryType?: string;
};

export type BrowserPerformanceNavigationInfo = {
  name: string;
  duration: number;
  startTime: number;
  domInteractive: number;
  domContentLoadedEventEnd: number;
  loadEventEnd: number;
  transferSize: number;
  encodedBodySize: number;
  decodedBodySize: number;
  deliveryType: string;
  responseStatus: number;
};

export type BrowserPerformanceResourceInfo = {
  name: string;
  duration: number;
  startTime: number;
  initiatorType: string;
  transferSize: number;
  encodedBodySize: number;
  decodedBodySize: number;
  deliveryType: string;
  renderBlockingStatus: string;
};

export type BrowserPerformancePageAnalysis = {
  timeOrigin: number;
  interactionCount?: number;
  eventCounts: Record<string, number>;
  memory?: BrowserPerformanceMemory;
  navigation?: BrowserPerformanceNavigationInfo;
  resources: BrowserPerformanceResourceInfo[];
};

export type BrowserPerformanceMemory = {
  jsHeapSizeLimit: number;
  totalJSHeapSize: number;
  usedJSHeapSize: number;
};

export type BrowserPerformanceMemoryMeasurement = {
  breakdown: Array<Record<string, unknown>>;
  bytes: number;
};

export type BrowserPerformanceNative = Performance & {
  memory?: BrowserPerformanceMemory;
  measureUserAgentSpecificMemory?: () => Promise<BrowserPerformanceMemoryMeasurement>;
};
