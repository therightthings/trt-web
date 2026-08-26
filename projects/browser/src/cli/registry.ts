import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import type { BrowserCliUtility } from './types.js';

const entries: Array<[string, string]> = [
  ['BrowserAI', 'Built-in browser AI helpers'],
  ['BrowserAudioContext', 'Web Audio API helpers'],
  ['BrowserBattery', 'Battery status helpers'],
  ['BrowserBluetooth', 'Web Bluetooth helpers'],
  ['BrowserCamera', 'Camera capture and recording'],
  ['BrowserClipboard', 'Clipboard read and write helpers'],
  ['Canvas', 'HTML Canvas drawing helpers'],
  ['BrowserEnvironment', 'Browser environment information'],
  ['BrowserFileSystem', 'File System Access API helpers'],
  ['IndexedDB', 'IndexedDB database and collection helpers'],
  ['BrowserLocation', 'Geolocation helpers'],
  ['BrowserMicrophone', 'Microphone capture and recording'],
  ['BrowserNetwork', 'Network status and connection information'],
  ['BrowserNfc', 'Web NFC helpers'],
  ['BrowserNotification', 'Web Notifications API helpers'],
  ['BrowserPeerConnection', 'WebRTC peer connection helpers'],
  ['BrowserPerformance', 'Performance API helpers'],
  ['BrowserPermission', 'Browser permission helpers'],
  ['BrowserPresentation', 'Fullscreen and picture-in-picture helpers'],
  ['BrowserResource', 'Browser resource loading and download helpers'],
  ['BrowserScreen', 'Screen sharing and recording'],
  ['BrowserSpeechToText', 'Speech recognition helpers'],
  ['BrowserTextToSpeech', 'Speech synthesis helpers'],
  ['BrowserTabActivity', 'Tab visibility and focus helpers'],
  ['BrowserTheme', 'System theme observation'],
  ['BrowserVibration', 'Vibration API helpers'],
  ['BrowserViewport', 'Responsive viewport state helpers'],
  ['BrowserWakeLock', 'Screen wake lock helpers'],
  ['BrowserWindow', 'Current window helpers'],
  ['BrowserWindowManager', 'Child window lifecycle helpers'],
  ['Cookie', 'Cookie storage helpers'],
  ['LocalStorage', 'Local storage helpers'],
  ['SessionStorage', 'Session storage helpers'],
];

const methodNames: Record<string, string[]> = {
  BrowserAI: [
    'isSupported()',
    'supportedFeatures()',
    'detectLanguage()',
    'summarize()',
    'translate()',
  ],
  BrowserAudioContext: [
    'isSupported()',
    'getInstance()',
    'ready()',
    'getState()',
    'suspend()',
    'resume()',
    'decodeAudioData()',
    'createAudioSession()',
    'createToneSession()',
    'playTone()',
    'close()',
  ],
  BrowserBattery: ['isSupported()', 'getState()', 'subscribe()'],
  BrowserBluetooth: [
    'isSupported()',
    'isAvailable()',
    'getPairedDevices()',
    'requestDevice()',
    'connect()',
    'disconnect()',
    'getDevice()',
    'getServer()',
    'getPrimaryService()',
    'getCharacteristic()',
    'getCharacteristics()',
    'readValue()',
    'writeValue()',
    'startNotifications()',
    'stopNotifications()',
  ],
  BrowserCamera: [
    'isSupported()',
    'facingModes()',
    'listDevices()',
    'turnOn()',
    'turnOff()',
    'createRecorder()',
  ],
  BrowserClipboard: ['isSupported()', 'copy()', 'read()'],
  Canvas: [
    'isSupported()',
    'createSession()',
    'CanvasSession.getContext()',
    'CanvasSession.getSize()',
    'CanvasSession.resize()',
    'CanvasSession.clear()',
    'CanvasSession.drawLine()',
    'CanvasSession.drawRectangle()',
    'CanvasSession.drawCircle()',
    'CanvasSession.drawText()',
    'CanvasSession.drawImage()',
    'CanvasSession.getImageData()',
    'CanvasSession.putImageData()',
    'CanvasSession.createGradient()',
    'CanvasSession.drawPath()',
    'CanvasSession.drawPolyline()',
    'CanvasSession.rotate()',
    'CanvasSession.scale()',
    'CanvasSession.translate()',
    'CanvasSession.flip()',
    'CanvasSession.resetTransform()',
    'CanvasSession.toBlob()',
    'CanvasSession.toDataUrl()',
  ],
  BrowserEnvironment: ['getLocale()', 'getInformation()'],
  BrowserFileSystem: [
    'isSupported()',
    'openFile()',
    'readFile()',
    'readFiles()',
    'saveFile()',
    'openDirectory()',
    'listDirectory()',
    'getOpfsRoot()',
    'readText()',
    'readArrayBuffer()',
    'writeText()',
    'appendText()',
    'removeEntry()',
    'requestPermission()',
  ],
  IndexedDB: ['isSupported()', 'register()', 'databases()'],
  BrowserLocation: ['getLocation()'],
  BrowserMicrophone: [
    'isSupported()',
    'listDevices()',
    'turnOn()',
    'turnOff()',
    'createRecorder()',
  ],
  BrowserNetwork: ['isSupported()', 'getState()', 'subscribe()', 'unsubscribe()'],
  BrowserNfc: ['isSupported()', 'isScanning()', 'startScan()', 'stopScan()', 'write()'],
  BrowserNotification: [
    'isSupported()',
    'getPermission()',
    'requestPermission()',
    'getMaxActions()',
    'show()',
  ],
  BrowserPeerConnection: [
    'isSupported()',
    'isConnected()',
    'getPeerConnection()',
    'createPeerConnection()',
    'addTrack()',
    'removeTrack()',
    'configureVideoSender()',
    'createDataChannel()',
    'createOffer()',
    'createAnswer()',
    'setLocalDescription()',
    'setRemoteDescription()',
    'addIceCandidate()',
    'getStats()',
    'restartIce()',
    'createConnectionFromOffer()',
    'close()',
  ],
  BrowserPerformance: [
    'isSupported()',
    'createSession()',
    'now()',
    'mark()',
    'measure()',
    'measureAsync()',
    'getEntries()',
    'getNavigationTiming()',
    'getResourceTiming()',
    'clearMarks()',
    'clearMeasures()',
    'analyzePage()',
  ],
  BrowserPermission: ['supportedPermissions()', 'getState()', 'request()'],
  BrowserPresentation: [
    'enterFullscreen()',
    'exitFullscreen()',
    'enterPictureInPicture()',
    'exitPictureInPicture()',
  ],
  BrowserResource: ['assetUrl()', 'isCached()', 'loadScript()', 'loadLink()', 'download()'],
  BrowserScreen: [
    'isSupported()',
    'startShare()',
    'stopShare()',
    'screenshot()',
    'createRecorder()',
  ],
  BrowserSpeechToText: ['isSupported()', 'recognize()'],
  BrowserTextToSpeech: [
    'isSupported()',
    'speak()',
    'getVoices()',
    'pause()',
    'resume()',
    'cancel()',
    'isSpeaking()',
    'isPaused()',
  ],
  BrowserTabActivity: ['isSupported()', 'getState()', 'subscribe()', 'unsubscribe()'],
  BrowserTheme: ['isSupported()', 'getSystemTheme()', 'subscribe()'],
  BrowserVibration: ['isSupported()', 'vibrate()', 'cancel()'],
  BrowserViewport: ['register()', 'getCurrentState()', 'isInRange()', 'subscribe()'],
  BrowserWakeLock: ['isSupported()', 'isActive()', 'enable()', 'disable()'],
  BrowserWindow: [
    'reload()',
    'goBack()',
    'goForward()',
    'pushState()',
    'replaceState()',
    'historyState()',
    'alert()',
    'confirm()',
    'prompt()',
    'print()',
    'preload()',
    'getKeyboardEventInfo()',
    'getPointerEventInfo()',
  ],
  BrowserWindowManager: ['open()'],
  Cookie: ['isSupported()', 'set()', 'get()', 'remove()', 'clear()', 'exists()'],
  LocalStorage: ['isSupported()', 'set()', 'get()', 'remove()', 'clear()', 'exists()'],
  SessionStorage: ['isSupported()', 'set()', 'get()', 'remove()', 'clear()', 'exists()'],
};

const methodDescription = (utilityName: string, name: string): string => {
  const methodName = name.replace(/^.*\./, '').replace(/\(.*$/, '');
  return (
    readmeMethodDescriptions[`${utilityName}.${methodName}`] ??
    readmeMethodDescriptions[methodName] ??
    'Public utility method.'
  );
};

const methodSignatures: Record<string, Record<string, string>> = {
  BrowserAI: {
    'isSupported()': 'isSupported(): boolean',
    'supportedFeatures()': 'supportedFeatures(): BrowserAISupportedFeatures',
    'detectLanguage()':
      'detectLanguage(input: string, options?: BrowserAIDetectLanguageOptions): Promise<BrowserAIDetection[]>',
    'summarize()': 'summarize(input: string, options?: BrowserAISummarizeOptions): Promise<string>',
    'translate()': 'translate(input: string, options: BrowserAITranslateOptions): Promise<string>',
  },
  BrowserBattery: {
    'isSupported()': 'isSupported(): boolean',
    'getState()': 'getState(): Promise<BrowserBatteryState | undefined>',
    'subscribe()':
      'subscribe(handler: (state: BrowserBatteryState) => void): Promise<BrowserSubscription>',
  },
  BrowserAudioContext: {
    'isSupported()': 'isSupported(): boolean',
    'getInstance()': 'getInstance(): BrowserAudioContext',
    'ready()': 'ready(options?: AudioContextOptions): Promise<AudioContext | undefined>',
    'getState()': 'getState(): AudioContextState | undefined',
    'suspend()': 'suspend(): Promise<boolean>',
    'resume()': 'resume(): Promise<boolean>',
    'decodeAudioData()': 'decodeAudioData(data: ArrayBuffer): Promise<AudioBuffer | undefined>',
    'createAudioSession()': 'createAudioSession(buffer: AudioBuffer): BrowserAudioSession',
    'createToneSession()':
      'createToneSession(options: BrowserAudioToneSessionOptions): BrowserAudioTonesSession | undefined',
    'playTone()': 'playTone(options: BrowserAudioToneSessionOptions): Promise<boolean>',
    'close()': 'close(): Promise<void>',
  },
  BrowserBluetooth: {
    'isSupported()': 'isSupported(): boolean',
    'isAvailable()': 'isAvailable(): Promise<boolean>',
    'getPairedDevices()': 'getPairedDevices(): Promise<BrowserBluetoothDevice[]>',
    'requestDevice()':
      'requestDevice(options?: BrowserBluetoothRequestOptions): Promise<BrowserBluetoothDevice | undefined>',
    'connect()':
      'connect(device?: BrowserBluetoothDevice): Promise<BrowserBluetoothRemoteGATTServer | undefined>',
    'disconnect()': 'disconnect(): Promise<void>',
    'getDevice()': 'getDevice(): BrowserBluetoothDevice | undefined',
    'getServer()': 'getServer(): BrowserBluetoothRemoteGATTServer | undefined',
    'getPrimaryService()':
      'getPrimaryService(service: BrowserBluetoothUUID): Promise<BrowserBluetoothRemoteGATTService | undefined>',
    'getCharacteristic()':
      'getCharacteristic(service: BrowserBluetoothUUID, characteristic: BrowserBluetoothUUID): Promise<BrowserBluetoothRemoteGATTCharacteristic | undefined>',
    'getCharacteristics()':
      'getCharacteristics(service: BrowserBluetoothUUID): Promise<BrowserBluetoothRemoteGATTCharacteristic[]>',
    'readValue()':
      'readValue(service: BrowserBluetoothUUID, characteristic: BrowserBluetoothUUID): Promise<DataView | undefined>',
    'writeValue()': 'writeValue(payload: BrowserBluetoothWritePayload): Promise<boolean>',
    'startNotifications()':
      'startNotifications(payload: BrowserBluetoothNotificationPayload): Promise<BrowserBluetoothRemoteGATTCharacteristic | undefined>',
    'stopNotifications()':
      'stopNotifications(payload: BrowserBluetoothStopNotificationPayload): void',
  },
  Canvas: {
    'isSupported()': 'isSupported(): boolean',
    'createSession()': 'createSession(canvas?: HTMLCanvasElement): CanvasSession',
    'CanvasSession.getContext()':
      'CanvasSession.getContext(): CanvasRenderingContext2D | undefined',
    'CanvasSession.getSize()': 'CanvasSession.getSize(): { width: number; height: number }',
    'CanvasSession.resize()': 'CanvasSession.resize(options?: CanvasResizeOptions): void',
    'CanvasSession.clear()':
      'CanvasSession.clear(fillStyle?: string | CanvasGradient | CanvasPattern): void',
    'CanvasSession.drawLine()': 'CanvasSession.drawLine(options: CanvasLineOptions): boolean',
    'CanvasSession.drawRectangle()':
      'CanvasSession.drawRectangle(options: CanvasRectangleOptions): boolean',
    'CanvasSession.drawCircle()': 'CanvasSession.drawCircle(options: CanvasCircleOptions): boolean',
    'CanvasSession.drawText()': 'CanvasSession.drawText(options: CanvasTextOptions): boolean',
    'CanvasSession.drawImage()': 'CanvasSession.drawImage(options: CanvasImageOptions): boolean',
    'CanvasSession.getImageData()':
      'CanvasSession.getImageData(options: CanvasImageDataArea): ImageData | undefined',
    'CanvasSession.putImageData()':
      'CanvasSession.putImageData(imageData: ImageData, options: CanvasPutImageDataOptions): boolean',
    'CanvasSession.createGradient()':
      'CanvasSession.createGradient(options: CanvasGradientOptions): CanvasGradient | undefined',
    'CanvasSession.drawPath()':
      'CanvasSession.drawPath(path: Path2D, options?: CanvasPathOptions): boolean',
    'CanvasSession.drawPolyline()':
      'CanvasSession.drawPolyline(options: CanvasPolylineOptions): boolean',
    'CanvasSession.rotate()': 'CanvasSession.rotate(angle: number): void',
    'CanvasSession.scale()': 'CanvasSession.scale(x: number, y: number): void',
    'CanvasSession.translate()': 'CanvasSession.translate(x: number, y: number): void',
    'CanvasSession.flip()': 'CanvasSession.flip(axis: CanvasFlipAxis): void',
    'CanvasSession.resetTransform()': 'CanvasSession.resetTransform(): void',
    'CanvasSession.toBlob()':
      'CanvasSession.toBlob(options?: CanvasBlobOptions): Promise<Blob | undefined>',
    'CanvasSession.toDataUrl()': 'CanvasSession.toDataUrl(type?: string, quality?: number): string',
  },
  BrowserFileSystem: {
    'isSupported()': 'isSupported(): boolean',
    'openFile()':
      'openFile(options?: BrowserFileSystemPickerOptions): Promise<BrowserFileSystemFileHandle | BrowserFileSystemFileHandle[] | undefined>',
    'readFile()':
      'readFile(options?: BrowserFileSystemPickerOptions): Promise<BrowserFileSystemReadFileResult | undefined>',
    'readFiles()':
      'readFiles(options?: BrowserFileSystemPickerOptions): Promise<BrowserFileSystemReadFileResult[]>',
    'saveFile()':
      'saveFile(data: BlobPart, options?: BrowserFileSystemSavePickerOptions): Promise<boolean>',
    'openDirectory()':
      'openDirectory(options?: BrowserFileSystemDirectoryPickerOptions): Promise<BrowserFileSystemDirectoryHandle | undefined>',
    'listDirectory()':
      'listDirectory(handle: BrowserFileSystemDirectoryHandle): Promise<BrowserFileSystemEntry[]>',
    'getOpfsRoot()': 'getOpfsRoot(): Promise<FileSystemDirectoryHandle | undefined>',
    'readText()': 'readText(handle: BrowserFileSystemFileHandle): Promise<string | undefined>',
    'readArrayBuffer()':
      'readArrayBuffer(handle: BrowserFileSystemFileHandle): Promise<ArrayBuffer | undefined>',
    'writeText()': 'writeText(handle: BrowserFileSystemFileHandle, text: string): Promise<boolean>',
    'appendText()':
      'appendText(handle: BrowserFileSystemFileHandle, text: string): Promise<boolean>',
    'removeEntry()':
      'removeEntry(handle: BrowserFileSystemDirectoryHandle, name: string, options?: { recursive?: boolean }): Promise<boolean>',
    'requestPermission()':
      'requestPermission(handle: BrowserFileSystemPermissionHandle, mode?: BrowserFileSystemPermissionMode): Promise<BrowserFileSystemPermissionState>',
  },
  IndexedDB: {
    'isSupported()': 'isSupported(): boolean',
    'register()': 'register(config: IndexedDBDatabaseConfig): IndexedDBDatabase',
    'databases()': 'databases(): Promise<IDBDatabaseInfo[]>',
  },
  BrowserClipboard: {
    'isSupported()': 'isSupported(): boolean',
    'copy()': 'copy(text: string): Promise<ExecuteBrowserServiceResult>',
    'read()': 'read(): Promise<string | undefined>',
  },
  BrowserEnvironment: {
    'getLocale()': 'getLocale(): string',
    'getInformation()':
      'getInformation(config?: BrowserEnvironmentInformationConfig): Promise<BrowserEnvironmentInformation>',
  },
  BrowserLocation: {
    'getLocation()':
      'getLocation(options?: BrowserLocationOptions): Promise<BrowserLocationResult>',
  },
  BrowserNetwork: {
    'isSupported()': 'isSupported(): boolean',
    'getState()': 'getState(): BrowserNetworkState',
    'subscribe()': 'subscribe(handler: (state: BrowserNetworkState) => void): BrowserSubscription',
    'unsubscribe()': 'unsubscribe(): void',
  },
  BrowserNfc: {
    'isSupported()': 'isSupported(): boolean',
    'isScanning()': 'isScanning(): boolean',
    'startScan()': 'startScan(options?: BrowserNfcScanOptions): Promise<boolean>',
    'stopScan()': 'stopScan(): void',
    'write()': 'write(message: NDEFMessageSource): Promise<boolean>',
  },
  BrowserTabActivity: {
    'isSupported()': 'isSupported(): boolean',
    'getState()': 'getState(): BrowserTabActivityState',
    'subscribe()':
      'subscribe(handler: (state: BrowserTabActivityState) => void): BrowserSubscription',
    'unsubscribe()': 'unsubscribe(): void',
  },
  BrowserTheme: {
    'isSupported()': 'isSupported(): boolean',
    'getSystemTheme()': 'getSystemTheme(): BrowserThemeMode',
    'subscribe()': 'subscribe(handler: (theme: BrowserThemeMode) => void): BrowserSubscription',
  },
  BrowserVibration: {
    'isSupported()': 'isSupported(): boolean',
    'vibrate()': 'vibrate(pattern: BrowserVibratePattern): boolean',
    'cancel()': 'cancel(): boolean',
  },
  BrowserViewport: {
    'register()': 'register(config: BrowserViewportConfig): void',
    'getCurrentState()': 'getCurrentState(): BrowserViewportState',
    'isInRange()': 'isInRange(range: BrowserViewportRangeName): boolean',
    'subscribe()': 'subscribe(handler: (state: BrowserViewportState) => void): BrowserSubscription',
  },
  BrowserWakeLock: {
    'isSupported()': 'isSupported(): boolean',
    'isActive()': 'isActive(): boolean',
    'enable()': 'enable(): Promise<boolean>',
    'disable()': 'disable(): Promise<void>',
  },
  BrowserSpeechToText: {
    'isSupported()': 'isSupported(): boolean',
    'recognize()': 'recognize(options?: BrowserSpeechToTextOptions): Promise<string | undefined>',
  },
  BrowserTextToSpeech: {
    'isSupported()': 'isSupported(): boolean',
    'speak()': 'speak(text: string, options?: BrowserTextToSpeechOptions): Promise<void>',
    'getVoices()': 'getVoices(): Promise<SpeechSynthesisVoice[]>',
    'pause()': 'pause(): void',
    'resume()': 'resume(): void',
    'cancel()': 'cancel(): void',
    'isSpeaking()': 'isSpeaking(): boolean',
    'isPaused()': 'isPaused(): boolean',
  },
  BrowserCamera: {
    'isSupported()': 'isSupported(): boolean',
    'facingModes()': 'facingModes(): Promise<BrowserCameraFacingMode[]>',
    'listDevices()': 'listDevices(): Promise<BrowserCameraDevice[]>',
    'turnOn()': 'turnOn(options?: BrowserCameraOptions): Promise<BrowserCameraResult>',
    'turnOff()': 'turnOff(): boolean',
    'createRecorder()':
      'createRecorder(options?: BrowserMediaRecorderOptions): Promise<BrowserMediaRecorderSession | undefined>',
  },
  BrowserMicrophone: {
    'isSupported()': 'isSupported(): boolean',
    'listDevices()': 'listDevices(): Promise<BrowserMicrophoneDevice[]>',
    'turnOn()': 'turnOn(options?: BrowserMicrophoneOptions): Promise<BrowserMicrophoneResult>',
    'turnOff()': 'turnOff(): boolean',
    'createRecorder()':
      'createRecorder(options?: BrowserMediaRecorderOptions): Promise<BrowserMediaRecorderSession | undefined>',
  },
  BrowserScreen: {
    'isSupported()': 'isSupported(): boolean',
    'startShare()': 'startShare(options?: BrowserScreenStreamConstraints): Promise<MediaStream>',
    'stopShare()': 'stopShare(): boolean',
    'screenshot()': 'screenshot(config?: BrowserScreenScreenshotConfig): Promise<Blob | undefined>',
    'createRecorder()':
      'createRecorder(options?: BrowserMediaRecorderOptions): Promise<BrowserMediaRecorderSession | undefined>',
  },
  BrowserPresentation: {
    'enterFullscreen()': 'enterFullscreen(element?: Element): Promise<boolean>',
    'exitFullscreen()': 'exitFullscreen(): Promise<boolean>',
    'enterPictureInPicture()': 'enterPictureInPicture(video: HTMLVideoElement): Promise<boolean>',
    'exitPictureInPicture()': 'exitPictureInPicture(): Promise<boolean>',
  },
  BrowserPermission: {
    'supportedPermissions()': 'supportedPermissions(): BrowserPermissionName[]',
    'getState()': 'getState(name: BrowserPermissionName): Promise<BrowserPermissionState>',
    'request()': 'request(name: BrowserPermissionName): Promise<BrowserPermissionState>',
  },
  BrowserNotification: {
    'isSupported()': 'isSupported(): boolean',
    'getPermission()': 'getPermission(): Promise<BrowserNotificationPermission>',
    'requestPermission()': 'requestPermission(): Promise<BrowserNotificationPermission>',
    'getMaxActions()': 'getMaxActions(): number | undefined',
    'show()':
      'show(title: string, options?: BrowserNotificationOptions): BrowserNotificationSession | undefined',
  },
  BrowserPeerConnection: {
    'isSupported()': 'isSupported(): boolean',
    'isConnected()': 'isConnected(): boolean',
    'getPeerConnection()': 'getPeerConnection(): RTCPeerConnection | undefined',
    'createPeerConnection()':
      'createPeerConnection(options?: BrowserPeerConnectionOptions): RTCPeerConnection | undefined',
    'addTrack()':
      'addTrack(track: MediaStreamTrack, ...streams: MediaStream[]): RTCRtpSender | undefined',
    'removeTrack()': 'removeTrack(sender: RTCRtpSender): void',
    'configureVideoSender()':
      'configureVideoSender(options: BrowserPeerConnectionVideoSenderOptions): Promise<boolean>',
    'createDataChannel()':
      'createDataChannel(label: string, options?: BrowserPeerConnectionDataChannelInit): RTCDataChannel | undefined',
    'createOffer()':
      'createOffer(options?: RTCOfferOptions): Promise<RTCSessionDescriptionInit | undefined>',
    'createAnswer()':
      'createAnswer(options?: RTCAnswerOptions): Promise<RTCSessionDescriptionInit | undefined>',
    'setLocalDescription()':
      'setLocalDescription(description?: RTCSessionDescriptionInit): Promise<boolean>',
    'setRemoteDescription()':
      'setRemoteDescription(description: RTCSessionDescriptionInit): Promise<boolean>',
    'addIceCandidate()': 'addIceCandidate(candidate: RTCIceCandidateInit | null): Promise<boolean>',
    'getStats()':
      'getStats(selector?: MediaStreamTrack | null): Promise<RTCStatsReport | undefined>',
    'restartIce()': 'restartIce(): boolean',
    'createConnectionFromOffer()':
      'createConnectionFromOffer(offer: RTCSessionDescriptionInit, options?: BrowserPeerConnectionOptions): Promise<RTCPeerConnection | undefined>',
    'close()': 'close(): void',
  },
  BrowserPerformance: {
    'isSupported()': 'isSupported(): boolean',
    'createSession()': 'createSession(): BrowserPerformanceSession | undefined',
    'now()': 'now(): number | undefined',
    'mark()': 'mark(name: string): boolean',
    'measure()':
      'measure(name: string, startMark?: string, endMark?: string): PerformanceMeasure | undefined',
    'measureAsync()':
      'measureAsync<T>(name: string, callback: () => Promise<T>): Promise<{ value: T; measure: PerformanceMeasure } | undefined>',
    'getEntries()': 'getEntries(options?: BrowserPerformanceEntriesOptions): PerformanceEntry[]',
    'getNavigationTiming()':
      'getNavigationTiming(): BrowserPerformanceNavigationTiming | undefined',
    'getResourceTiming()': 'getResourceTiming(): PerformanceResourceTiming[]',
    'clearMarks()': 'clearMarks(name?: string): void',
    'clearMeasures()': 'clearMeasures(name?: string): void',
    'analyzePage()': 'analyzePage(): BrowserPerformancePageAnalysis | undefined',
  },
  BrowserResource: {
    'assetUrl()': 'assetUrl(path: string): string',
    'isCached()': 'isCached(url: string, options?: BrowserResourceCacheOptions): Promise<boolean>',
    'loadScript()': 'loadScript(src: string): Promise<HTMLScriptElement>',
    'loadLink()': 'loadLink(href: string): Promise<HTMLLinkElement>',
    'download()':
      'download(src: string | Blob | File, config?: BrowserResourceDownloadConfig): Promise<void>',
  },
  BrowserWindow: {
    'reload()': 'reload(): void',
    'goBack()': 'goBack(): void',
    'goForward()': 'goForward(): void',
    'pushState()': 'pushState(data: unknown, unused: string, url?: string | URL): void',
    'replaceState()': 'replaceState(data: unknown, unused: string, url?: string | URL): void',
    'historyState()': 'historyState(): unknown',
    'alert()': 'alert(message: string): void',
    'confirm()': 'confirm(message: string): boolean',
    'prompt()': 'prompt(title: string, defaultValue?: string): string | null',
    'print()': 'print(): void',
    'preload()':
      'preload(url: string, options?: BrowserWindowPreloadOptions): HTMLLinkElement | undefined',
    'getKeyboardEventInfo()':
      'getKeyboardEventInfo(event: KeyboardEvent): BrowserKeyboardEventInfo',
    'getPointerEventInfo()': 'getPointerEventInfo(event: PointerEvent): BrowserPointerEventInfo',
  },
  BrowserWindowManager: {
    'open()': 'open(config?: BrowserWindowOpenConfig): BrowserWindowInstance | null',
  },
  Cookie: {
    'isSupported()': 'isSupported(): boolean',
    'set()': 'set<T>(name: string, value: T, config?: CookieSetConfig): void',
    'get()': 'get<T>(name: string): T | undefined',
    'remove()': 'remove(name: string, config?: CookieSetConfig): void',
    'clear()': 'clear(): void',
    'exists()': 'exists(name: string): boolean',
  },
  LocalStorage: {
    'isSupported()': 'isSupported(): boolean',
    'set()': 'set<T>(key: string, value: T): void',
    'get()': 'get<T>(key: string): T | undefined',
    'remove()': 'remove(key: string): void',
    'clear()': 'clear(): void',
    'exists()': 'exists(key: string): boolean',
  },
  SessionStorage: {
    'isSupported()': 'isSupported(): boolean',
    'set()': 'set<T>(key: string, value: T): void',
    'get()': 'get<T>(key: string): T | undefined',
    'remove()': 'remove(key: string): void',
    'clear()': 'clear(): void',
    'exists()': 'exists(key: string): boolean',
  },
};

const readmeExamples = readExamplesFromReadme();
const readmeMethodDescriptions = readMethodDescriptionsFromReadme();

function readMethodDescriptionsFromReadme(): Record<string, string> {
  try {
    const readmePath = fileURLToPath(new URL('../../README.md', import.meta.url));
    const readme = readFileSync(readmePath, 'utf8');
    const descriptions: Record<string, string> = {};
    const names = entries.map(([name]) => name).join('|');
    const headingPattern = new RegExp(`^- \\x60(${names})\\x60`, 'gm');
    const headings = [...readme.matchAll(headingPattern)];

    headings.forEach((headingMatch, index) => {
      const utilityName = headingMatch[1];
      const start = headingMatch.index ?? 0;
      const end = headings[index + 1]?.index ?? readme.length;
      const section = readme.slice(start, end);
      const pattern = /^\s*- \x60([^\x60]+)\x60:\s*(.+)$/gm;

      for (const match of section.matchAll(pattern)) {
        descriptions[`${utilityName}.${match[1]}`] ??= match[2];
      }
    });

    const pattern = /^\s*- \x60([^\x60]+)\x60:\s*(.+)$/gm;
    for (const match of readme.matchAll(pattern)) {
      descriptions[match[1]] ??= match[2];
    }

    return descriptions;
  } catch {
    return {};
  }
}

function readExamplesFromReadme(): Record<string, string> {
  try {
    const readmePath = fileURLToPath(new URL('../../README.md', import.meta.url));
    const readme = readFileSync(readmePath, 'utf8');
    const examples: Record<string, string> = {};
    const names = entries.map(([name]) => name).join('|');
    const headingPattern = new RegExp(`^- \\x60(${names})\\x60`, 'gm');
    const headings = [...readme.matchAll(headingPattern)];

    headings.forEach((match, index) => {
      const heading = match[1];
      const start = match.index ?? 0;
      const end = headings[index + 1]?.index ?? readme.length;
      const section = readme.slice(start, end);
      const codeBlocks = [
        ...section.matchAll(/\n\s*\x60\x60\x60ts\n([\s\S]*?)\n\s*\x60\x60\x60/g),
      ].map((codeBlock) => codeBlock[1]);
      if (heading && codeBlocks.length > 0 && entries.some(([name]) => name === heading)) {
        examples[heading] = codeBlocks.join('\n\n');
      }
    });

    return examples;
  } catch {
    return {};
  }
}

export const browserUtilities: BrowserCliUtility[] = entries.map(([name, description]) => ({
  name,
  description,
  example: readmeExamples[name],
  methods: (methodNames[name] ?? []).map((method) => ({
    name: method,
    signature: methodSignatures[name]?.[method],
    description: methodDescription(name, method),
    example: `${name}.${method.replace('()', '')}();`,
  })),
}));
