import {
  BrowserAI,
  BrowserAudioContext,
  BrowserBluetooth,
  BrowserCamera,
  BrowserClipboard,
  BrowserEnvironment,
  BrowserFileSystem,
  BrowserMicrophone,
  BrowserNetwork,
  BrowserNfc,
  BrowserNotification,
  BrowserPeerConnection,
  BrowserPerformance,
  BrowserScreen,
  BrowserTabActivity,
  BrowserVibration,
  BrowserWakeLock,
  Cookie,
  IndexedDB,
  LocalStorage,
  SessionStorage,
} from '@trt-web/browser';

import { createDemoPage, type DemoPageConfig } from '../components/demo-page';
import { createGroupPage, type GroupPageConfig } from './group-page';

const demoActions: Record<
  string,
  Array<{ label: string; run: () => unknown | Promise<unknown> }>
> = {
  clipboard: [
    { label: 'Copy demo text', run: () => BrowserClipboard.copy('Hello from core-demo') },
    { label: 'Read clipboard', run: () => BrowserClipboard.read() },
  ],
  environment: [
    { label: 'Read all information', run: () => BrowserEnvironment.getInformation() },
    { label: 'Read hardware', run: () => BrowserEnvironment.getInformation({ scope: 'hardware' }) },
  ],
  'tab-activity': [{ label: 'Read tab state', run: () => BrowserTabActivity.getState() }],
  vibration: [{ label: 'Vibrate briefly', run: () => BrowserVibration.vibrate(200) }],
  'wake-lock': [
    { label: 'Enable wake lock', run: () => BrowserWakeLock.enable() },
    { label: 'Disable wake lock', run: () => BrowserWakeLock.disable() },
  ],
};

const supportChecks: Record<string, () => boolean> = {
  ai: () => BrowserAI.isSupported(),
  'audio-context': () => BrowserAudioContext.isSupported(),
  bluetooth: () => BrowserBluetooth.isSupported(),
  camera: () => BrowserCamera.isSupported(),
  cookie: () => Cookie.isSupported(),
  'file-system': () => BrowserFileSystem.isSupported(),
  'indexed-db': () => IndexedDB.isSupported(),
  'local-storage': () => LocalStorage.isSupported(),
  microphone: () => BrowserMicrophone.isSupported(),
  network: () => BrowserNetwork.isSupported(),
  performance: () => BrowserPerformance.isSupported(),
  notification: () => BrowserNotification.isSupported(),
  nfc: () => BrowserNfc.isSupported(),
  screen: () => BrowserScreen.isSupported(),
  'session-storage': () => SessionStorage.isSupported(),
  vibration: () => BrowserVibration.isSupported(),
  'wake-lock': () => BrowserWakeLock.isSupported(),
  'peer-connection': () => BrowserPeerConnection.isSupported(),
};

const pages: Record<string, DemoPageConfig> = {
  browser: {
    title: 'Browser',
    path: 'browser',
    description: 'Browser APIs and framework-free browser utilities.',
    methods: [],
  },
  'date-handler': {
    title: 'Date',
    path: 'date-handler',
    description: 'Date and time helpers.',
    methods: [],
  },
  'dom-handler': {
    title: 'Dom',
    path: 'dom-handler',
    description: 'DOM inspection and browser styling helpers.',
    methods: [],
  },
  'file-handler': {
    title: 'File',
    path: 'file-handler',
    description: 'File, image and file-size helpers.',
    methods: [],
  },
  'number-handler': {
    title: 'Number',
    path: 'number-handler',
    description: 'Number formatting, generation and calculation helpers.',
    methods: [],
  },
  'obj-handler': {
    title: 'Object',
    path: 'obj-handler',
    description: 'Object cleanup and deduplication helpers.',
    methods: [],
  },
  'rate-limit': {
    title: 'Timing',
    path: 'rate-limit',
    description: 'Debounce, throttle and async wait helpers.',
    methods: [],
  },
  'string-handler': {
    title: 'String',
    path: 'string-handler',
    description: 'String normalization, search and generation helpers.',
    methods: [],
  },
  capitalize: {
    title: 'capitalize',
    path: 'string-handler/capitalize',
    description: 'Capitalize text or selected object fields.',
    methods: ['capitalize(data, config?)'],
  },
  'generate-hash': {
    title: 'generateHash',
    path: 'string-handler/generate-hash',
    description: 'Generate a SHA-256 hash from data.',
    methods: ['generateHash(data)'],
  },
  'generate-id': {
    title: 'generateId',
    path: 'string-handler/generate-id',
    description: 'Generate a cryptographically random UUID.',
    methods: ['generateId()'],
  },
  'generate-random-string': {
    title: 'generateRandomString',
    path: 'string-handler/generate-random-string',
    description: 'Generate a secure random hexadecimal string.',
    methods: ['generateRandomString(length?)'],
  },
  'generate-sort-order-key': {
    title: 'generateSortOrderKey',
    path: 'string-handler/generate-sort-order-key',
    description: 'Generate sortable keys before, after or between existing keys.',
    methods: ['generateSortOrderKey(config?)'],
  },
  'remove-tones': {
    title: 'removeTones',
    path: 'string-handler/remove-tones',
    description: 'Normalize accented and searchable text.',
    methods: ['removeTones(value, config?)'],
  },
  'search-key': {
    title: 'generateSearchKeys',
    path: 'string-handler/search-key',
    description: 'Generate normalized search prefixes and phrases.',
    methods: ['generateSearchKeys(value, options?)'],
  },
  debounce: {
    title: 'debounce',
    path: 'rate-limit/debounce',
    description: 'Delay execution until calls stop.',
    methods: ['debounce(function, wait, options?)'],
  },
  throttle: {
    title: 'throttle',
    path: 'rate-limit/throttle',
    description: 'Limit execution to once per wait window.',
    methods: ['throttle(function, wait, options?)'],
  },
  wait: {
    title: 'wait',
    path: 'rate-limit/wait',
    description: 'Pause an async flow for a configured duration.',
    methods: ['wait(time)'],
  },
  'clean-obj': {
    title: 'cleanObj',
    path: 'obj-handler/clean-obj',
    description: 'Remove empty values recursively while preserving meaningful data.',
    methods: ['cleanObj(object)'],
  },
  'remove-duplicate-objects': {
    title: 'removeDuplicateObjects',
    path: 'obj-handler/remove-duplicate-objects',
    description: 'Remove duplicate values while keeping the first item.',
    methods: ['removeDuplicateObjects(array, filterFn?)'],
  },
  'bayesian-rating': {
    title: 'Bayesian rating',
    path: 'number-handler/bayesian-rating',
    description: 'Calculate simple and global-average Bayesian ratings.',
    methods: ['calcSimpleBayesianRating()', 'calcBayesianRating()'],
  },
  'format-view-count': {
    title: 'formatViewCount',
    path: 'number-handler/format-view-count',
    description: 'Format large view counts with compact suffixes.',
    methods: ['formatViewCount(value, config?)'],
  },
  'haversine-distance': {
    title: 'calcHaversineDistance',
    path: 'number-handler/haversine-distance',
    description: 'Calculate distance between geographic coordinates.',
    methods: ['calcHaversineDistance(from, to, options?)'],
  },
  'random-number': {
    title: 'generateRandomNumber',
    path: 'number-handler/random-number',
    description: 'Generate random integers or decimal numbers.',
    methods: ['generateRandomNumber(min, max, config?)'],
  },
  'compress-image': {
    title: 'compressImageFile',
    path: 'file-handler/compress-image',
    description: 'Resize and compress an image into a new File.',
    methods: ['compressImageFile(file, config?)'],
  },
  'convert-file-size': {
    title: 'convertFileSize',
    path: 'file-handler/convert-file-size',
    description: 'Convert file sizes between supported units.',
    methods: ['convertFileSize(value, unit, config?)'],
  },
  'file-to-data-url': {
    title: 'fileToDataUrl',
    path: 'file-handler/file-to-data-url',
    description: 'Read a file as a data URL.',
    methods: ['fileToDataUrl(file)'],
  },
  'file-to-object-url': {
    title: 'fileToObjectUrl',
    path: 'file-handler/file-to-object-url',
    description: 'Create an object URL from a file or data URL.',
    methods: ['fileToObjectUrl(source, options?)'],
  },
  'get-image-size': {
    title: 'getImageSize',
    path: 'file-handler/get-image-size',
    description: 'Read image dimensions from a File.',
    methods: ['getImageSize(file, options?)'],
  },
  'load-image': {
    title: 'loadImage',
    path: 'file-handler/load-image',
    description: 'Load an image URL into an HTMLImageElement.',
    methods: ['loadImage(src)'],
  },
  'generate-random-color': {
    title: 'generateRandomColor',
    path: 'dom-handler/generate-random-color',
    description: 'Generate random colors in hex or RGB format.',
    methods: ['generateRandomColor(config?)'],
  },
  canvas: {
    title: 'Canvas',
    path: 'dom-handler/canvas',
    description: 'Create a CanvasSession and draw 2D graphics.',
    methods: ['Canvas.isSupported()', 'Canvas.createSession()'],
  },
  'get-element-info': {
    title: 'getElementInfo',
    path: 'dom-handler/get-element-info',
    description: 'Inspect element dimensions, offsets and scroll state.',
    methods: ['getElementInfo(element)'],
  },
  'var-css': {
    title: 'varCSS',
    path: 'dom-handler/var-css',
    description: 'Read or set a document-root CSS custom property.',
    methods: ['varCSS(name, value?)'],
  },
  'generate-timestamp': {
    title: 'generateTimestamp',
    path: 'date-handler/generate-timestamp',
    description: 'Generate an ISO timestamp for the current date and time.',
    methods: ['generateTimestamp()'],
  },
  'range-date': {
    title: 'getDateRange',
    path: 'date-handler/range-date',
    description: 'Resolve preset and dynamic UTC date ranges.',
    methods: ['getDateRange(range, rootDate?)'],
  },
  'audio-context': {
    title: 'BrowserAudioContext',
    path: 'browser/audio-context',
    description: 'Create, control and analyze audio using AudioContext.',
    methods: [
      'isSupported()',
      'getInstance()',
      'ready()',
      'getState()',
      'suspend()',
      'resume()',
      'decodeAudioData()',
      'playTone()',
      'createAudioSession()',
      'close()',
    ],
  },
  ai: {
    title: 'BrowserAI',
    path: 'browser/ai',
    description: 'Use built-in browser AI for detection, summarization and translation.',
    methods: [
      'isSupported()',
      'supportedFeatures()',
      'detectAvailability()',
      'summarizeAvailability()',
      'translateAvailability()',
      'detectLanguage()',
      'summarize()',
      'translate()',
    ],
  },
  bluetooth: {
    title: 'BrowserBluetooth',
    path: 'browser/bluetooth',
    description: 'Discover and communicate with Bluetooth devices.',
    methods: ['isSupported()', 'requestDevice()', 'connect()', 'readValue()', 'writeValue()'],
  },
  clipboard: {
    title: 'BrowserClipboard',
    path: 'browser/clipboard',
    description: 'Read and write text through the Clipboard API.',
    methods: ['copy()', 'read()'],
  },
  cookie: {
    title: 'Cookie',
    path: 'browser/cookie',
    description: 'Store and retrieve typed values in browser cookies.',
    methods: ['isSupported()', 'set()', 'get()', 'remove()', 'clear()', 'exists()'],
  },
  environment: {
    title: 'BrowserEnvironment',
    path: 'browser/environment',
    description: 'Inspect locale, hardware and browser environment details.',
    methods: ['getLocale()', 'getInformation()'],
  },
  'file-system': {
    title: 'BrowserFileSystem',
    path: 'browser/file-system',
    description: 'Open, save and manage files and directories.',
    methods: [
      'isSupported()',
      'openFile()',
      'readFile()',
      'readFiles()',
      'saveFile()',
      'openDirectory()',
    ],
  },
  'indexed-db': {
    title: 'IndexedDB',
    path: 'browser/indexed-db',
    description: 'Persist structured data in browser databases and collections.',
    methods: ['isSupported()', 'register()', 'databases()'],
  },
  'local-storage': {
    title: 'LocalStorage',
    path: 'browser/local-storage',
    description: "Use Core's typed LocalStorage wrapper.",
    methods: ['isSupported()', 'set()', 'get()', 'remove()', 'clear()', 'exists()'],
  },
  location: {
    title: 'BrowserLocation',
    path: 'browser/location',
    description: 'Request the current device location with permission handling.',
    methods: ['getLocation()'],
  },
  camera: {
    title: 'BrowserCamera',
    path: 'browser/media/camera',
    description: 'Turn on camera streams and record camera media.',
    methods: [
      'isSupported()',
      'currentStream',
      'isStreamActive',
      'listDevices()',
      'turnOn()',
      'createRecorder()',
      'turnOff()',
    ],
  },
  microphone: {
    title: 'BrowserMicrophone',
    path: 'browser/media/microphone',
    description: 'Turn on microphone streams and record audio.',
    methods: [
      'isSupported()',
      'currentStream',
      'isStreamActive',
      'listDevices()',
      'turnOn()',
      'createRecorder()',
      'turnOff()',
    ],
  },
  screen: {
    title: 'BrowserScreen',
    path: 'browser/media/screen',
    description: 'Capture, record and take screenshots of a selected screen.',
    methods: [
      'isSupported()',
      'currentStream',
      'isStreamActive',
      'startShare()',
      'screenshot()',
      'createRecorder()',
      'stopShare()',
    ],
  },
  network: {
    title: 'BrowserNetwork',
    path: 'browser/network',
    description: 'Read online state and subscribe to network changes.',
    methods: ['isSupported()', 'getState()', 'subscribe()', 'unsubscribe()'],
  },
  performance: {
    title: 'BrowserPerformance',
    path: 'browser/performance',
    description: 'Measure tasks and inspect browser performance timing data.',
    methods: [
      'isSupported()',
      'createSession()',
      'now()',
      'mark()',
      'measure()',
      'measureAsync()',
      'getEntries()',
      'getNavigationTiming()',
      'getResourceTiming()',
    ],
  },
  notification: {
    title: 'BrowserNotification',
    path: 'browser/notification',
    description: 'Request permission and display browser notifications.',
    methods: [
      'isSupported()',
      'getPermission()',
      'requestPermission()',
      'getMaxActions()',
      'show()',
    ],
  },
  nfc: {
    title: 'BrowserNfc',
    path: 'browser/nfc',
    description: 'Scan and write NFC messages on supported devices.',
    methods: ['isSupported()', 'startScan()', 'stopScan()', 'write()'],
  },
  permission: {
    title: 'BrowserPermission',
    path: 'browser/permission',
    description: 'Inspect and request browser permissions.',
    methods: ['supportedPermissions()', 'getState()', 'request()'],
  },
  presentation: {
    title: 'BrowserPresentation',
    path: 'browser/presentation',
    description: 'Control fullscreen and picture-in-picture presentation.',
    methods: ['enterFullscreen()', 'exitFullscreen()', 'enterPictureInPicture()'],
  },
  resource: {
    title: 'BrowserResource',
    path: 'browser/resource',
    description: 'Load, cache and download browser resources.',
    methods: ['assetUrl()', 'isCached()', 'loadScript()', 'loadLink()', 'download()'],
  },
  'session-storage': {
    title: 'SessionStorage',
    path: 'browser/session-storage',
    description: "Use Core's typed SessionStorage wrapper.",
    methods: ['isSupported()', 'set()', 'get()', 'remove()', 'clear()', 'exists()'],
  },
  share: {
    title: 'BrowserShare',
    path: 'browser/share',
    description: 'Share content using the Web Share API.',
    methods: ['share()'],
  },
  'text-to-speech': {
    title: 'BrowserTextToSpeech',
    path: 'browser/speech/text-to-speech',
    description: 'Convert text into spoken audio using Speech Synthesis.',
    methods: ['speak()', 'getVoices()', 'pause()', 'resume()', 'cancel()', 'isSupported()'],
  },
  'speech-to-text': {
    title: 'BrowserSpeechToText',
    path: 'browser/speech/speech-to-text',
    description: 'Convert microphone speech into text using Speech Recognition.',
    methods: ['recognize()', 'isSupported()'],
  },
  'tab-activity': {
    title: 'BrowserTabActivity',
    path: 'browser/tab-activity',
    description: 'Read and observe whether the current tab is active.',
    methods: ['getState()', 'subscribe()'],
  },
  vibration: {
    title: 'BrowserVibration',
    path: 'browser/vibration',
    description: 'Trigger and cancel device vibration.',
    methods: ['isSupported()', 'vibrate()', 'cancel()'],
  },
  'wake-lock': {
    title: 'BrowserWakeLock',
    path: 'browser/wake-lock',
    description: 'Prevent the screen from sleeping while a task is active.',
    methods: ['isSupported()', 'isActive()', 'enable()', 'disable()'],
  },
  viewport: {
    title: 'BrowserViewport',
    path: 'browser/viewport',
    description: 'Read viewport state and subscribe to global resize changes.',
    methods: ['register()', 'getCurrentState()', 'isInRange()', 'subscribe()'],
  },
  battery: {
    title: 'BrowserBattery',
    path: 'browser/battery',
    description: 'Read battery status and subscribe to battery changes.',
    methods: ['isSupported()', 'getState()', 'subscribe()'],
  },
  'peer-connection': {
    title: 'BrowserPeerConnection',
    path: 'browser/peer-connection',
    description: 'Create peer connections and exchange realtime data.',
    methods: [
      'isSupported()',
      'createPeerConnection()',
      'createOffer()',
      'createAnswer()',
      'close()',
    ],
  },
  window: {
    title: 'BrowserWindow',
    path: 'browser/window',
    description: 'Use current-window helpers and manage child windows.',
    methods: ['goBack()', 'goForward()', 'alert()', 'confirm()', 'prompt()'],
  },
  'window-manager': {
    title: 'BrowserWindowManager',
    path: 'browser/window-manager',
    description: 'Open and monitor child browser windows.',
    methods: ['open()'],
  },
  worker: {
    title: 'Worker utilities',
    path: 'browser/worker',
    description: 'Create and run browser workers from reusable functions.',
    methods: ['createWorker()', 'runWorker()'],
  },
};

const formatEntryLabel = (value: string): string =>
  value
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

export const groupPages: Record<string, GroupPageConfig> = {
  browser: {
    title: 'Browser',
    path: 'browser',
    description: 'Choose a browser utility to explore.',
    entries: [
      ['ai', 'AI'],
      ['audio-context', 'Audio Context'],
      ['bluetooth', 'Bluetooth'],
      ['clipboard', 'Clipboard'],
      ['cookie', 'Cookie'],
      ['environment', 'Environment'],
      ['file-system', 'File System'],
      ['indexed-db', 'Indexed DB'],
      ['local-storage', 'Local Storage'],
      ['location', 'Location'],
      ['camera', 'Camera'],
      ['microphone', 'Microphone'],
      ['screen', 'Screen'],
      ['nfc', 'NFC'],
      ['network', 'Network'],
      ['performance', 'Performance'],
      ['notification', 'Notification'],
      ['permission', 'Permission'],
      ['presentation', 'Presentation'],
      ['resource', 'Resource'],
      ['session-storage', 'Session Storage'],
      ['share', 'Share'],
      ['text-to-speech', 'Text To Speech'],
      ['speech-to-text', 'Speech To Text'],
      ['tab-activity', 'Tab Activity'],
      ['vibration', 'Vibration'],
      ['wake-lock', 'Wake Lock'],
      ['peer-connection', 'Peer Connection'],
      ['window', 'Window'],
      ['window-manager', 'Window Manager'],
      ['worker', 'Worker'],
    ].map(([id, label]) => ({
      id,
      label,
      path: `browser/${id === 'camera' || id === 'microphone' || id === 'screen' ? `media/${id}` : id}`,
    })),
  },
  'date-handler': {
    title: 'Date',
    path: 'date-handler',
    description: 'Choose a date utility to explore.',
    entries: [
      ['generate-timestamp', 'Generate Timestamp'],
      ['range-date', 'Date Range'],
    ].map(([id, label]) => ({ id, label, path: `date-handler/${id}` })),
  },
  'dom-handler': {
    title: 'Dom',
    path: 'dom-handler',
    description: 'Choose a DOM utility to explore.',
    entries: [
      ['canvas', 'Canvas'],
      ['generate-random-color', 'Generate Random Color'],
      ['get-element-info', 'Get Element Info'],
      ['var-css', 'CSS Variable'],
    ].map(([id, label]) => ({ id, label, path: `dom-handler/${id}` })),
  },
  'file-handler': {
    title: 'File',
    path: 'file-handler',
    description: 'Choose a file utility to explore.',
    entries: [
      'compress-image',
      'convert-file-size',
      'file-to-data-url',
      'file-to-object-url',
      'get-image-size',
      'load-image',
    ].map((id) => ({ id, label: formatEntryLabel(id), path: `file-handler/${id}` })),
  },
  'number-handler': {
    title: 'Number',
    path: 'number-handler',
    description: 'Choose a number utility to explore.',
    entries: ['bayesian-rating', 'format-view-count', 'haversine-distance', 'random-number'].map(
      (id) => ({ id, label: formatEntryLabel(id), path: `number-handler/${id}` }),
    ),
  },
  'obj-handler': {
    title: 'Object',
    path: 'obj-handler',
    description: 'Choose an object utility to explore.',
    entries: [
      ['clean-obj', 'Clean Object'],
      ['remove-duplicate-objects', 'Remove Duplicate Objects'],
    ].map(([id, label]) => ({ id, label, path: `obj-handler/${id}` })),
  },
  'rate-limit': {
    title: 'Timing',
    path: 'rate-limit',
    description: 'Choose a rate-limit utility to explore.',
    entries: ['debounce', 'throttle', 'wait'].map((id) => ({
      id,
      label: id.charAt(0).toUpperCase() + id.slice(1),
      path: `rate-limit/${id}`,
    })),
  },
  'string-handler': {
    title: 'String',
    path: 'string-handler',
    description: 'Choose a string utility to explore.',
    entries: [
      'capitalize',
      'generate-hash',
      'generate-id',
      'generate-random-string',
      'generate-sort-order-key',
      'remove-tones',
      'search-key',
    ].map((id) => ({ id, label: formatEntryLabel(id), path: `string-handler/${id}` })),
  },
};

type LazyPageFactory = () => Promise<HTMLElement>;

const lazyPageFactories: Record<string, LazyPageFactory> = {
  ai: async () => (await import('./browser/ai-page')).createAiPage(),
  'audio-context': async () =>
    (await import('./browser/audio-context-page')).createAudioContextPage(),
  battery: async () => (await import('./browser/battery-page')).createBatteryPage(),
  bluetooth: async () => (await import('./browser/bluetooth-page')).createBluetoothPage(),
  camera: async () => (await import('./browser/camera-page')).createCameraPage(),
  canvas: async () => (await import('./dom/canvas-page')).createCanvasPage(),
  capitalize: async () => (await import('./string/capitalize-page')).createCapitalizePage(),
  cookie: async () => (await import('./browser/cookie-page')).createCookiePage(),
  'clean-obj': async () => (await import('./object/clean-object-page')).createCleanObjectPage(),
  'compress-image': async () =>
    (await import('./file/compress-image-page')).createCompressImagePage(),
  'convert-file-size': async () =>
    (await import('./file/convert-file-size-page')).createConvertFileSizePage(),
  debounce: async () => (await import('./rate-limit/debounce-page')).createDebouncePage(),
  environment: async () => (await import('./browser/environment-page')).createEnvironmentPage(),
  'file-system': async () => (await import('./browser/file-system-page')).createFileSystemPage(),
  'file-to-data-url': async () =>
    (await import('./file/file-to-data-url-page')).createFileToDataUrlPage(),
  'file-to-object-url': async () =>
    (await import('./file/file-to-object-url-page')).createFileToObjectUrlPage(),
  'format-view-count': async () =>
    (await import('./number/format-view-count-page')).createFormatViewCountPage(),
  'generate-hash': async () =>
    (await import('./string/generate-hash-page')).createGenerateHashPage(),
  'generate-id': async () => (await import('./string/generate-id-page')).createGenerateIdPage(),
  'generate-random-color': async () =>
    (await import('./dom/generate-random-color-page')).createGenerateRandomColorPage(),
  'generate-random-string': async () =>
    (await import('./string/generate-random-string-page')).createGenerateRandomStringPage(),
  'generate-sort-order-key': async () =>
    (await import('./string/generate-sort-order-key-page')).createGenerateSortOrderKeyPage(),
  'generate-timestamp': async () => (await import('./date-pages')).createGenerateTimestampPage(),
  'get-element-info': async () =>
    (await import('./dom/get-element-info-page')).createGetElementInfoPage(),
  'get-image-size': async () =>
    (await import('./file/get-image-size-page')).createGetImageSizePage(),
  'haversine-distance': async () =>
    (await import('./number/haversine-distance-page')).createHaversineDistancePage(),
  'indexed-db': async () => (await import('./browser/indexed-db-page')).createIndexedDbPage(),
  'load-image': async () => (await import('./file/load-image-page')).createLoadImagePage(),
  location: async () => (await import('./browser/location-page')).createLocationPage(),
  'local-storage': async () => (await import('./browser/storage-page')).createStoragePage('local'),
  microphone: async () => (await import('./browser/microphone-page')).createMicrophonePage(),
  network: async () => (await import('./browser/network-page')).createNetworkPage(),
  nfc: async () => (await import('./browser/nfc-page')).createNfcPage(),
  notification: async () => (await import('./browser/notification-page')).createNotificationPage(),
  'peer-connection': async () =>
    (await import('./browser/peer-connection-page')).createPeerConnectionPage(),
  performance: async () => (await import('./browser/performance-page')).createPerformancePage(),
  permission: async () => (await import('./browser/permission-page')).createPermissionPage(),
  presentation: async () => (await import('./browser/presentation-page')).createPresentationPage(),
  'random-number': async () =>
    (await import('./number/random-number-page')).createRandomNumberPage(),
  'range-date': async () => (await import('./date-pages')).createRangeDatePage(),
  'remove-tones': async () => (await import('./string/remove-tones-page')).createRemoveTonesPage(),
  'remove-duplicate-objects': async () =>
    (await import('./object/remove-duplicate-objects-page')).createRemoveDuplicateObjectsPage(),
  resource: async () => (await import('./browser/resource-page')).createResourcePage(),
  screen: async () => (await import('./browser/screen-page')).createScreenPage(),
  'search-key': async () => (await import('./string/search-key-page')).createSearchKeyPage(),
  'session-storage': async () =>
    (await import('./browser/storage-page')).createStoragePage('session'),
  share: async () => (await import('./browser/share-page')).createSharePage(),
  'speech-to-text': async () =>
    (await import('./browser/speech-to-text-page')).createSpeechToTextPage(),
  'tab-activity': async () => (await import('./browser/tab-activity-page')).createTabActivityPage(),
  throttle: async () => (await import('./rate-limit/throttle-page')).createThrottlePage(),
  'text-to-speech': async () =>
    (await import('./browser/text-to-speech-page')).createTextToSpeechPage(),
  'var-css': async () => (await import('./dom/var-css-page')).createVarCssPage(),
  vibration: async () => (await import('./browser/vibration-page')).createVibrationPage(),
  viewport: async () => (await import('./browser/viewport-page')).createViewportPage(),
  'wake-lock': async () => (await import('./browser/wake-lock-page')).createWakeLockPage(),
  wait: async () => (await import('./rate-limit/wait-page')).createWaitPage(),
  window: async () => (await import('./browser/window-page')).createWindowPage(),
  'window-manager': async () =>
    (await import('./browser/window-manager-page')).createWindowManagerPage(),
  worker: async () => (await import('./browser/worker-page')).createWorkerPage(),
};

export const createBrowserPage = async (pageId: string): Promise<HTMLElement | null> => {
  if (groupPages[pageId]) {
    return createGroupPage(groupPages[pageId]);
  }

  const factory = lazyPageFactories[pageId];
  if (factory) {
    return factory();
  }

  const config = pages[pageId];
  return config
    ? createDemoPage({
        ...config,
        checkSupport: supportChecks[pageId],
        actions: demoActions[pageId],
      })
    : null;
};

export const getBrowserPagePath = (pageId: string): string | null => {
  return pages[pageId]?.path ?? null;
};

export const getBrowserPageId = (path: string): string | null => {
  const entry = Object.entries(pages).find(([, config]) => config.path === path);
  return entry?.[0] ?? null;
};
