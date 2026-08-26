import * as trt from './lib';

export { createWorker, runWorker } from './lib/browser';
export type * from './lib/browser/static';
export {
  BrowserAI,
  BrowserAudioContext,
  BrowserAudioTonesSession,
  BrowserBattery,
  BrowserBluetooth,
  BrowserCamera,
  BrowserClipboard,
  BrowserEnvironment,
  BrowserFileSystem,
  BrowserLocation,
  BrowserMicrophone,
  BrowserNetwork,
  BrowserNfc,
  BrowserNotification,
  BrowserNotificationSession,
  BrowserPeerConnection,
  BrowserPerformance,
  BrowserPerformanceSession,
  BrowserPermission,
  BrowserPresentation,
  BrowserResource,
  BrowserScreen,
  BrowserShare,
  BrowserSpeechToText,
  BrowserTabActivity,
  BrowserTextToSpeech,
  BrowserTheme,
  BrowserVibration,
  BrowserViewport,
  BrowserWakeLock,
  BrowserWindow,
  BrowserWindowManager,
  Cookie,
  IndexedDB,
  LocalStorage,
  SessionStorage,
} from './lib/browser/static';
export type {
  CanvasBlobOptions,
  CanvasCircleOptions,
  CanvasContextOptions,
  CanvasImageOptions,
  CanvasLineOptions,
  CanvasRectangleOptions,
  CanvasResizeOptions,
  CanvasTextOptions,
} from './lib/dom-handler';
export { Canvas, CanvasSession } from './lib/dom-handler';
export { trt };
