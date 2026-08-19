import * as trt from './lib';

export { createWorker, runWorker } from './lib/browser';
export type * from './lib/browser/static';
export {
  AbstractBrowserUtils,
  BrowserAudioContext,
  BrowserBluetooth,
  BrowserCamera,
  BrowserClipboard,
  BrowserEnvironment,
  BrowserFileSystem,
  BrowserLocation,
  BrowserMedia,
  BrowserMicrophone,
  BrowserNetwork,
  BrowserNfc,
  BrowserPeerConnection,
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
  BrowserWakeLock,
  BrowserWindow,
  BrowserWindowManager,
  Cookie,
  IndexedDB,
  LocalStorage,
  SessionStorage,
} from './lib/browser/static';
export { trt };
