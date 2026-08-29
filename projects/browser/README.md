# @trt-web/browser

Framework-free wrappers for modern browser APIs and web platform features.

## BrowserAI

Built-in browser AI helpers

### Methods

- `isSupported(): boolean`: check whether at least one supported built-in browser AI API is available.
- `supportedFeatures(): BrowserAISupportedFeatures`: return support status for each built-in AI feature.
- `detectLanguage(input: string, options?: BrowserAIDetectLanguageOptions): Promise<BrowserAIDetection[]>`: detect languages and confidence scores from text.
- `summarize(input: string, options?: BrowserAISummarizeOptions): Promise<string>`: summarize text with the selected format and length.
- `translate(input: string, options: BrowserAITranslateOptions): Promise<string>`: translate text between the selected source and target languages.

### Examples

```ts
import { BrowserAI } from '@trt-web/browser';
onProgress: ({ phase, progress }) => {
  console.log(phase, `${Math.round(progress * 100)}%`);
};
// Output: downloading 50%
// Output: processing 0%
// Output: done 100%

if (BrowserAI.isTranslatorSupported()) {
  const availability = await BrowserAI.translateAvailability({
    sourceLanguage: 'en',
    targetLanguage: 'vi',
  });

  if (availability === 'available') {
    const translated = await BrowserAI.translate('Hello from the browser', {
      sourceLanguage: 'en',
      targetLanguage: 'vi',
      onProgress: (progress) => {
        console.log(progress.phase, `${Math.round(progress.progress * 100)}%`);
      },
    });
    console.log(translated);
  }
}

const detections = await BrowserAI.detectLanguage('Bonjour tout le monde', {
  onProgress: (progress) => {
    console.log(progress.phase, `${Math.round(progress.progress * 100)}%`);
  },
});
console.log(detections);

const summary = await BrowserAI.summarize('Long text...', {
  format: 'plain-text',
  length: 'short',
  onProgress: (progress) => {
    console.log(progress.phase, `${Math.round(progress.progress * 100)}%`);
  },
});
console.log(summary);
```

## BrowserAudioContext

Web Audio API helpers

### Methods

- `isSupported(): boolean`: check whether the Web Audio API is supported.
- `getInstance(): BrowserAudioContext`: get the shared audio context manager.
- `ready(options?: AudioContextOptions): Promise<AudioContext | undefined>`: resume the audio context when required.
- `getState(): AudioContextState | undefined`: read the current AudioContext state.
- `suspend(): Promise<boolean>`: suspend all audio processing in the shared context.
- `resume(): Promise<boolean>`: resume all audio processing in the shared context.
- `decodeAudioData(data: ArrayBuffer): Promise<AudioBuffer | undefined>`: decode an ArrayBuffer into an AudioBuffer.
- `createAudioSession(buffer: AudioBuffer): BrowserAudioSession`: create an isolated audio playback session.
- `createToneSession(options: BrowserAudioToneSessionOptions): BrowserAudioTonesSession | undefined`: create an isolated oscillator tone session.
- `playTone(options: BrowserAudioToneSessionOptions): Promise<boolean>`: play a sequence of oscillator tones.
- `close(): Promise<void>`: close the shared audio context.

### Examples

```ts
import { BrowserAudioContext } from '@trt-web/browser';
if (!BrowserAudioContext.isSupported()) {
  throw new Error('Web Audio API is not supported.');
}

const audioContext = BrowserAudioContext.getInstance();

const context = await audioContext.ready({ latencyHint: 'interactive' });
if (!context) {
  throw new Error('Could not create AudioContext.');
}

console.log(audioContext.getState()); // running

await audioContext.suspend();
await audioContext.resume();

await audioContext.playTone({
  tones: [
    { frequency: 523, type: 'sine', gain: 0.08, durationMs: 90, gapMs: 40 },
    { frequency: 659, type: 'sine', gain: 0.08, durationMs: 120 },
  ],
});

const file = await fetch('/audio/example.mp3').then((response) => response.blob());
const audioBuffer = await audioContext.decodeAudioData(await file.arrayBuffer());
const session = audioBuffer ? audioContext.createAudioSession(audioBuffer) : undefined;
session?.play();
await new Promise((resolve) => setTimeout(resolve, (audioBuffer?.duration ?? 0) * 1000));
session?.stop();

await audioContext.close();

const toneSession = audioContext.createToneSession({
  tones: [
    { frequency: 523, type: 'sine', gain: 0.08, durationMs: 300, gapMs: 40 },
    { frequency: 659, type: 'sine', gain: 0.08, durationMs: 300 },
  ],
});

toneSession?.createAnalyser({ fftSize: 256, smoothingTimeConstant: 0.8 });
const started = await toneSession?.play();
const frequencyData = toneSession?.getFrequencyData();
const timeDomainData = toneSession?.getTimeDomainData();

console.log(started, toneSession?.state); // true 'playing'
console.log(frequencyData?.length); // analyser.frequencyBinCount
console.log(timeDomainData?.length); // analyser.fftSize

toneSession?.stop();
console.log(toneSession?.state); // 'stopped'

const session = audioContext.createAudioSession(audioBuffer);

session?.play();
session?.pause();
session?.resume();
session?.stop();

session?.createAnalyser({ fftSize: 2048 });
console.log(session?.getFrequencyData());
console.log(session?.getTimeDomainData());
console.log(session?.getWaveformData({ samples: 500 }));
```

## BrowserBattery

Battery status helpers

### Methods

- `isSupported(): boolean`: check whether the Battery Status API is available.
- `getState(): Promise<BrowserBatteryState | undefined>`: read the current charging status, battery percentage, and estimated times.
- `subscribe(handler: (state: BrowserBatteryState) => void): Promise<BrowserSubscription>`: listen for charging, level, charging-time, and discharging-time changes.

### Examples

```ts
if (BrowserBattery.isSupported()) {
  const state = await BrowserBattery.getState();
  console.log(state);
  // {
  //   charging: true,
  //   percent: 80,
  //   chargingTimeSeconds: 1800,
  //   dischargingTimeSeconds: 9007199254740991,
  // }

  const subscription = await BrowserBattery.subscribe((nextState) => {
    console.log(nextState.percent, nextState.charging);
  });

  subscription.unsubscribe();
}
```

## BrowserBluetooth

Web Bluetooth helpers

### Methods

- `isSupported(): boolean`: check whether Web Bluetooth is supported.
- `isAvailable(): Promise<boolean>`: check whether Bluetooth is currently available.
- `getPairedDevices(): Promise<BrowserBluetoothDevice[]>`: list previously permitted Bluetooth devices.
- `requestDevice(options?: BrowserBluetoothRequestOptions): Promise<BrowserBluetoothDevice | undefined>`: request a Bluetooth device from the user.
- `connect(device?: BrowserBluetoothDevice): Promise<BrowserBluetoothRemoteGATTServer | undefined>`: connect to the device's GATT server.
- `disconnect(): Promise<void>`: disconnect from the current GATT server.
- `getDevice(): BrowserBluetoothDevice | undefined`: get the currently connected Bluetooth device.
- `getServer(): BrowserBluetoothRemoteGATTServer | undefined`: get the currently connected GATT server.
- `getPrimaryService(service: BrowserBluetoothUUID): Promise<BrowserBluetoothRemoteGATTService | undefined>`: get a primary GATT service.
- `getCharacteristic(service: BrowserBluetoothUUID, characteristic: BrowserBluetoothUUID): Promise<BrowserBluetoothRemoteGATTCharacteristic | undefined>`: get a characteristic from a service.
- `getCharacteristics(service: BrowserBluetoothUUID): Promise<BrowserBluetoothRemoteGATTCharacteristic[]>`: list characteristics from a service.
- `readValue(service: BrowserBluetoothUUID, characteristic: BrowserBluetoothUUID): Promise<DataView | undefined>`: read a characteristic value.
- `writeValue(payload: BrowserBluetoothWritePayload): Promise<boolean>`: write a value to a characteristic.
- `startNotifications(payload: BrowserBluetoothNotificationPayload): Promise<BrowserBluetoothRemoteGATTCharacteristic | undefined>`: listen for characteristic value changes.
- `stopNotifications(payload: BrowserBluetoothStopNotificationPayload): void`: stop characteristic notifications.

### Examples

```ts
import { BrowserBluetooth } from '@trt-web/browser';
const device = await BrowserBluetooth.requestDevice({
  filters: [{ services: ['heart_rate'] }],
});
await BrowserBluetooth.connect(device);
console.log(BrowserBluetooth.getDevice(), BrowserBluetooth.getServer());
const value = await BrowserBluetooth.readValue({
  service: 'heart_rate',
  characteristic: 'heart_rate_measurement',
});
await BrowserBluetooth.disconnect();
console.log(value);
```

## BrowserCamera

Camera capture and recording

### Methods

- `isSupported(): boolean`: check whether camera capture is supported.
- `facingModes(): Promise<BrowserCameraFacingMode[]>`: detect available camera facing modes.
- `listDevices(): Promise<BrowserCameraDevice[]>`: list available camera devices.
- `turnOn(options?: BrowserCameraOptions): Promise<BrowserCameraResult>`: request and start a camera stream.
- `turnOff(): boolean`: stop the current camera stream.
- `createRecorder(options?: BrowserMediaRecorderOptions): Promise<BrowserMediaRecorderSession | undefined>`: create an independent recorder session for the camera stream.

### Examples

```ts
import { BrowserCamera } from '@trt-web/browser';
const video = document.querySelector<HTMLVideoElement>('#camera-preview')!;
const result = await BrowserCamera.turnOn({ facingMode: 'front' });
if (result.success) {
  video.srcObject = result.data;

  const recorder = await BrowserCamera.createRecorder({ mimeType: 'video/webm' });
  recorder?.pause();
  recorder?.resume();

  const output = await recorder?.stop();
  console.log(output?.blob);

  BrowserCamera.turnOff();
}
```

## BrowserClipboard

Clipboard read and write helpers

### Methods

- `isSupported(): boolean`: check whether the HTML Canvas API is available.
- `copy(text: string): Promise<ExecuteBrowserServiceResult>`: copy text to the clipboard.
- `read(): Promise<string | undefined>`: read text from the clipboard.

### Examples

```ts
import { BrowserClipboard } from '@trt-web/browser';
const copied = await BrowserClipboard.copy('Copied from the browser');
const text = await BrowserClipboard.read();
console.log(copied); // { permission: 'granted', data: 'Copied from the browser', success: true }
console.log(text); // 'Copied from the browser'

const blocked = await BrowserClipboard.copy('Blocked text');
console.log(blocked); // { permission: 'denied', success: false }
```

## Canvas

HTML Canvas drawing helpers

### Methods

- `isSupported(): boolean`: check whether the HTML Canvas API is available.
- `createSession(canvas?: HTMLCanvasElement): CanvasSession`: create an isolated `CanvasSession` for a canvas element.
- `CanvasSession.getContext(): CanvasRenderingContext2D | undefined`: get the session's 2D rendering context.
- `CanvasSession.getSize(): { width: number; height: number }`: read the canvas backing-store size.
- `CanvasSession.resize(options?: CanvasResizeOptions): void`: resize the canvas, optionally fitting its element or parent and applying device-pixel-ratio scaling.
- `CanvasSession.clear(fillStyle?: string | CanvasGradient | CanvasPattern): void`: clear the canvas and optionally fill it with a color.
- `CanvasSession.drawLine(options: CanvasLineOptions): boolean`: draw a line with stroke options.
- `CanvasSession.drawRectangle(options: CanvasRectangleOptions): boolean`: draw a filled and/or stroked rectangle, optionally with rounded corners.
- `CanvasSession.drawCircle(options: CanvasCircleOptions): boolean`: draw a filled and/or stroked circle.
- `CanvasSession.drawText(options: CanvasTextOptions): boolean`: draw text with font and alignment options.
- `CanvasSession.drawImage(options: CanvasImageOptions): boolean`: draw an image source at a position and optional size.
- `CanvasSession.getImageData(options: CanvasImageDataArea): ImageData | undefined`: read pixel data from a rectangular area.
- `CanvasSession.putImageData(imageData: ImageData, options: CanvasPutImageDataOptions): boolean`: write pixel data to the canvas.
- `CanvasSession.createGradient(options: CanvasGradientOptions): CanvasGradient | undefined`: create a linear or radial gradient.
- `CanvasSession.drawPath(path: Path2D, options?: CanvasPathOptions): boolean`: draw or fill a `Path2D` path.
- `CanvasSession.drawPolyline(options: CanvasPolylineOptions): boolean`: draw an ordered list of points as an open or closed stroked path.
- `CanvasSession.rotate(angle: number): void`: rotate the current drawing transform.
- `CanvasSession.scale(x: number, y: number): void`: scale the current drawing transform.
- `CanvasSession.translate(x: number, y: number): void`: translate the current drawing transform.
- `CanvasSession.flip(axis: CanvasFlipAxis): void`: flip the current drawing transform horizontally or vertically.
- `CanvasSession.resetTransform(): void`: reset the current drawing transform.
- `CanvasSession.toBlob(options?: CanvasBlobOptions): Promise<Blob | undefined>`: export the canvas as a `Blob`.
- `CanvasSession.toDataUrl(type?: string, quality?: number): string`: export the canvas as a data URL.

### Examples

```ts
import { Canvas } from '@trt-web/browser';

const session = Canvas.createSession();
session.resize({ height: 180, width: 320 });
session.clear('#172236');
session.drawLine({
  start: [16, 16],
  end: [180, 80],
  strokeStyle: '#7dd3fc',
  lineWidth: 4,
});
session.drawText({
  text: 'Canvas',
  x: 16,
  y: 120,
  fillStyle: '#e8edf5',
  font: '24px sans-serif',
});

const gradient = session.createGradient({
  type: 'linear',
  x0: 0,
  y0: 0,
  x1: 320,
  y1: 180,
  stops: [
    { offset: 0, color: '#0ea5e9' },
    { offset: 1, color: '#8b5cf6' },
  ],
});
session.drawRectangle({
  fillStyle: gradient,
  height: 80,
  radius: 16,
  width: 240,
  x: 40,
  y: 140,
});

const path = new Path2D();
path.moveTo(40, 260);
path.lineTo(160, 190);
path.lineTo(280, 260);
path.closePath();
session.drawPath(path, { fillStyle: '#1e3a5f', strokeStyle: '#7dd3fc', lineWidth: 2 });

session.drawPolyline({
  points: [
    [16, 280],
    [80, 240],
    [160, 280],
  ],
  strokeStyle: '#7dd3fc',
  lineCap: 'round',
  lineJoin: 'round',
  lineWidth: 4,
});

const pixels = session.getImageData({ x: 0, y: 0, width: 20, height: 20 });
if (pixels) {
  session.putImageData(pixels, { x: 300, y: 20 });
}

session.translate(160, 90);
session.rotate(Math.PI / 8);
session.scale(1.1, 1.1);
session.flip('horizontal');
session.resetTransform();

const blob = await session.toBlob({ type: 'image/png' });
const dataUrl = session.toDataUrl('image/png');
console.log(blob, dataUrl); // Blob, 'data:image/png;base64,...'
```

## BrowserEnvironment

Browser environment information

### Methods

- `getLocale(): string`: get the user's preferred locale.
- `getInformation(config?: BrowserEnvironmentInformationConfig): Promise<BrowserEnvironmentInformation>`: get browser environment, hardware, battery, storage, screen, or all information.

### Examples

```ts
import { BrowserEnvironment } from '@trt-web/browser';

const locale = BrowserEnvironment.getLocale();
const hardware = await BrowserEnvironment.getInformation({ scope: 'hardware' });
const battery = await BrowserEnvironment.getInformation({ scope: 'battery' });
const environment = await BrowserEnvironment.getInformation({ scope: 'environment' });
const screen = await BrowserEnvironment.getInformation({ scope: 'screen' });
const all = await BrowserEnvironment.getInformation(); // 'all' is the default scope

console.log(locale); // 'en'
console.log(hardware); // { hardware: { cores: 8, memoryGB: 16 } }
console.log(battery); // { battery: { charging: true, percent: 50 } }
console.log(environment); // { environment: { locale: 'en-US', preferredLanguages: ['en-US', 'vi-VN'], os: 'macOS', browser: 'Safari', browserVersion: 17, engine: 'WebKit', deviceType: 'desktop' } }
console.log(screen.screenInfo.window); // { innerWidth: 1280, innerHeight: 720, outerHeight: 900, outerWidth: 1440 }
console.log(all.storageHealth); // { ratio: 0.5, quotaGB: 0, persistent: true, risk: 'low' }
```

## BrowserFileSystem

File System Access API helpers

### Methods

- `isSupported(): boolean`: check whether the File System Access API is supported.
- `openFile(options?: BrowserFileSystemPickerOptions): Promise<BrowserFileSystemFileHandle | BrowserFileSystemFileHandle[] | undefined>`: open one or more file handles from the device.
- `readFile(options?: BrowserFileSystemPickerOptions): Promise<BrowserFileSystemReadFileResult | undefined>`: open and read one file.
- `readFiles(options?: BrowserFileSystemPickerOptions): Promise<BrowserFileSystemReadFileResult[]>`: open and read multiple files.
- `saveFile(data: BlobPart, options?: BrowserFileSystemSavePickerOptions): Promise<boolean>`: save data through the file picker.
- `openDirectory(options?: BrowserFileSystemDirectoryPickerOptions): Promise<BrowserFileSystemDirectoryHandle | undefined>`: open a directory handle.
- `listDirectory(handle: BrowserFileSystemDirectoryHandle): Promise<BrowserFileSystemEntry[]>`: list files and directories from a directory handle.
- `getOpfsRoot(): Promise<FileSystemDirectoryHandle | undefined>`: get the origin private file system root.
- `readText(handle: BrowserFileSystemFileHandle): Promise<string | undefined>`: read text from an existing file handle.
- `readArrayBuffer(handle: BrowserFileSystemFileHandle): Promise<ArrayBuffer | undefined>`: read binary data from an existing file handle.
- `writeText(handle: BrowserFileSystemFileHandle, text: string): Promise<boolean>`: replace a file's text contents.
- `appendText(handle: BrowserFileSystemFileHandle, text: string): Promise<boolean>`: append text to a file.
- `removeEntry(handle: BrowserFileSystemDirectoryHandle, name: string, options?: { recursive?: boolean }): Promise<boolean>`: remove a file or directory entry.
- `requestPermission(handle: BrowserFileSystemPermissionHandle, mode?: BrowserFileSystemPermissionMode): Promise<BrowserFileSystemPermissionState>`: query and request access to a file or directory handle.

### Examples

```ts
import { BrowserFileSystem } from '@trt-web/browser';
const file = await BrowserFileSystem.readFile();
if (file) {
  console.log(file.file.name, file.file.size);
}

const fileHandle = await BrowserFileSystem.openFile();
if (fileHandle && !Array.isArray(fileHandle)) {
  const binary = await BrowserFileSystem.readArrayBuffer(fileHandle);
  const text = await BrowserFileSystem.readText(fileHandle);
  console.log(binary?.byteLength, text);
}
```

## IndexedDB

IndexedDB database and collection helpers

### Methods

- `isSupported(): boolean`: check whether IndexedDB is available in the browser.
- `register(config: IndexedDBDatabaseConfig): IndexedDBDatabase`: register a database, its version, and its collections.
- `databases(): Promise<IDBDatabaseInfo[]>`: list databases available on the current origin.

### Examples

```ts
import { IndexedDB } from '@trt-web/core';

type User = {
  id: number;
  name: string;
  email: string;
};

if (IndexedDB.isSupported()) {
  const appDatabase = IndexedDB.register({
    database: 'MyAppDB',
    version: 1,
    collections: ['users'],
  });

  const users = appDatabase.collection<User>('users');

  await users.put({
    id: 1,
    name: 'Alice',
    email: 'alice@example.com',
  });

  const user = await users.get(1);
  const allUsers = await users.getAll();

  console.log(user); // { id: 1, name: 'Alice', email: 'alice@example.com' }
  console.log(allUsers); // [{ id: 1, name: 'Alice', email: 'alice@example.com' }]

  await users.remove(1);
  await users.clear();

  // The record is removed and the collection is empty after clear().
}
```

## BrowserLocation

Geolocation helpers

### Methods

- `getLocation(options?: BrowserLocationOptions): Promise<BrowserLocationResult>`: get the current geolocation with permission handling and speed presets.

### Examples

```ts
import { BrowserLocation } from '@trt-web/browser';
const location = await BrowserLocation.getLocation({ speed: 'fast' });
console.log(location); // { permission: 'granted', data: { coords: { latitude: 5, longitude: 6 } }, success: true }
console.log(await BrowserLocation.getLocation({ speed: 'accurate' })); // { permission: 'granted', data: { coords: { latitude: 3, longitude: 4 } }, success: true }
console.log(await BrowserLocation.getLocation()); // { permission: 'unsupported', success: false } when geolocation is unavailable
```

## BrowserMicrophone

Microphone capture and recording

### Methods

- `isSupported(): boolean`: check whether microphone capture is supported.
- `listDevices(): Promise<BrowserMicrophoneDevice[]>`: list available microphone devices.
- `turnOn(options?: BrowserMicrophoneOptions): Promise<BrowserMicrophoneResult>`: request and start a microphone stream.
- `turnOff(): boolean`: stop the current microphone stream.
- `createRecorder(options?: BrowserMediaRecorderOptions): Promise<BrowserMediaRecorderSession | undefined>`: create an independent recorder session for the microphone stream.

### Examples

```ts
import { BrowserMicrophone } from '@trt-web/browser';
const audio = document.querySelector<HTMLAudioElement>('#microphone-preview')!;
const result = await BrowserMicrophone.turnOn();

if (result.success) {
  audio.srcObject = result.data;
  await audio.play();

  const recorder = await BrowserMicrophone.createRecorder({ mimeType: 'audio/webm' });
  recorder?.pause();
  recorder?.resume();

  const output = await recorder?.stop();
  console.log(output?.blob);

  BrowserMicrophone.turnOff();
}
```

## BrowserNetwork

Network status and connection information

### Methods

- `isSupported(): boolean`: check whether network information is available.
- `getState(): BrowserNetworkState`: read online status and connection information.
- `subscribe(handler: (state: BrowserNetworkState) => void): BrowserSubscription`: listen for network changes and return a subscription.
- `unsubscribe(): void`: unsubscribe all active network subscriptions.

### Examples

```ts
import { BrowserNetwork } from '@trt-web/browser';
const subscription = BrowserNetwork.subscribe((state) => {
  console.log(state.status, state.effectiveType);
});

subscription.unsubscribe();
BrowserNetwork.unsubscribe(); // remove any remaining network subscriptions
```

## BrowserNfc

Web NFC helpers

### Methods

- `isSupported(): boolean`: check whether Web NFC is supported.
- `isScanning(): boolean`: check whether NFC scanning is active.
- `startScan(options?: BrowserNfcScanOptions): Promise<boolean>`: start reading NFC messages.
- `stopScan(): void`: stop NFC scanning.
- `write(message: NDEFMessageSource): Promise<boolean>`: write an NFC message.

### Examples

```ts
import { BrowserNfc } from '@trt-web/browser';
await BrowserNfc.startScan({
  onReading: (event) => console.log(event.message),
});
await BrowserNfc.write({ records: [{ recordType: 'text', data: 'Hello NFC' }] });
BrowserNfc.stopScan();
```

## BrowserNotification

Web Notifications API helpers

### Methods

- `isSupported(): boolean`: check whether the Notifications API is available in a secure context.
- `getPermission(): Promise<BrowserNotificationPermission>`: read the current notification permission.
- `requestPermission(): Promise<BrowserNotificationPermission>`: request permission from the user.
- `getMaxActions(): number | undefined`: read the maximum number of notification actions supported by the browser.
- `show(title: string, options?: BrowserNotificationOptions): BrowserNotificationSession | undefined`: create a notification session when permission is granted.

### Examples

```ts
import { BrowserNotification } from '@trt-web/browser';
if (BrowserNotification.isSupported()) {
  const permission = await BrowserNotification.getPermission();
  const nextPermission =
    permission === 'prompt' ? await BrowserNotification.requestPermission() : permission;

  if (nextPermission === 'granted') {
    const notification = BrowserNotification.show('New message', {
      body: 'You have a new message.',
      icon: '/icons/notification.png',
      tag: 'messages',
      requireInteraction: true,
      data: { messageId: 42 },
    });

    notification?.addEventListener('show', () => console.log('Notification shown'));
    notification?.addEventListener('click', () => console.log('Notification clicked'));
    notification?.addEventListener('close', () => console.log('Notification closed'));
    notification?.addEventListener('error', () => console.log('Notification failed'));

    console.log(notification?.getInfo().content.title); // 'New message'
    console.log(notification?.getInfo().content.body); // 'You have a new message.'
    console.log(BrowserNotification.getMaxActions()); // number | undefined

    notification?.close();
  }
}

const progressNotification = BrowserNotification.show('Downloading file', {
  body: '45% completed',
  tag: 'download-progress',
  renotify: true,
  icon: '/icons/download.png',
});

console.log(progressNotification?.getInfo().behavior.tag); // 'download-progress'
console.log(progressNotification?.getInfo().behavior.renotify); // true

const callNotification = BrowserNotification.show('Incoming call', {
  body: 'Alice is calling you.',
  tag: 'call-123',
  requireInteraction: true,
  icon: '/icons/call.png',
  data: { callId: 'call-123' },
});

callNotification?.addEventListener('click', () => {
  window.focus();
  window.location.assign('/calls/call-123');
});
```

## BrowserPeerConnection

WebRTC peer connection helpers

### Methods

- `isSupported(): boolean`: check secure-context WebRTC support.
- `isConnected(): boolean`: check whether the peer connection is connected.
- `getPeerConnection(): RTCPeerConnection | undefined`: Public utility method.
- `createPeerConnection(options?: BrowserPeerConnectionOptions): RTCPeerConnection | undefined`: create and configure a peer connection.
- `addTrack(track: MediaStreamTrack, ...streams: MediaStream[]): RTCRtpSender | undefined`: add a media track to the peer connection.
- `removeTrack(sender: RTCRtpSender): void`: remove a sender from the peer connection.
- `configureVideoSender(options: BrowserPeerConnectionVideoSenderOptions): Promise<boolean>`: configure video bitrate and frame rate.
- `createDataChannel(label: string, options?: BrowserPeerConnectionDataChannelInit): RTCDataChannel | undefined`: create a data channel.
- `createOffer(options?: RTCOfferOptions): Promise<RTCSessionDescriptionInit | undefined>`: create an SDP offer.
- `createAnswer(options?: RTCAnswerOptions): Promise<RTCSessionDescriptionInit | undefined>`: create an SDP answer.
- `setLocalDescription(description?: RTCSessionDescriptionInit): Promise<boolean>`: set the local SDP description.
- `setRemoteDescription(description: RTCSessionDescriptionInit): Promise<boolean>`: set the remote SDP description.
- `addIceCandidate(candidate: RTCIceCandidateInit | null): Promise<boolean>`: add a remote ICE candidate.
- `getStats(selector?: MediaStreamTrack | null): Promise<RTCStatsReport | undefined>`: read connection statistics.
- `restartIce(): boolean`: request an ICE restart.
- `createConnectionFromOffer(offer: RTCSessionDescriptionInit, options?: BrowserPeerConnectionOptions): Promise<RTCPeerConnection | undefined>`: create a connection and apply a remote offer.
- `close(): void`: close the peer connection and remove listeners.

### Examples

```ts
import { BrowserPeerConnection } from '@trt-web/browser';
BrowserPeerConnection.createPeerConnection({
  config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] },
  handlers: { onIceCandidate: (event) => console.log(event.candidate) },
});
const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
const sender = BrowserPeerConnection.addTrack(stream.getVideoTracks()[0], stream);
await BrowserPeerConnection.configureVideoSender({
  maxBitrate: 1_000_000,
  maxFramerate: 30,
});
if (sender) {
  BrowserPeerConnection.removeTrack(sender);
}
const offer = await BrowserPeerConnection.createOffer();
await BrowserPeerConnection.setLocalDescription(offer);
BrowserPeerConnection.close();

if (offer) {
  const connection = await BrowserPeerConnection.createConnectionFromOffer({
    offer,
    handlers: { onIceCandidate: (event) => console.log(event.candidate) },
  });
  connection?.close();
}
```

## BrowserPerformance

Performance API helpers

### Methods

- `isSupported(): boolean`: check whether the Performance API is available.
- `createSession(): BrowserPerformanceSession | undefined`: create a session exposing the native Performance properties and methods.
- `now(): number | undefined`: Public utility method.
- `mark(name: string): boolean`: Public utility method.
- `measure(name: string, startMark?: string, endMark?: string): PerformanceMeasure | undefined`: Public utility method.
- `measureAsync<T>(name: string, callback: () => Promise<T>): Promise<{ value: T; measure: PerformanceMeasure } | undefined>`: Public utility method.
- `getEntries(options?: BrowserPerformanceEntriesOptions): PerformanceEntry[]`: Public utility method.
- `getNavigationTiming(): BrowserPerformanceNavigationTiming | undefined`: Public utility method.
- `getResourceTiming(): PerformanceResourceTiming[]`: Public utility method.
- `clearMarks(name?: string): void`: Public utility method.
- `clearMeasures(name?: string): void`: Public utility method.
- `analyzePage(): BrowserPerformancePageAnalysis | undefined`: return a normalized snapshot of current page navigation, resources, memory, and interaction data.

### Examples

```ts
import { BrowserPerformance } from '@trt-web/browser';
const result = await BrowserPerformance.measureAsync('load-users', async () => {
  return await loadUsers();
});

console.log(result?.value, result?.measure.duration);
// Output: [{ id: 1, name: 'Alice' }] 42.5

const performance = BrowserPerformance.createSession();

console.log(performance?.timeOrigin);
console.log(performance?.getEntriesByType('resource'));
console.log(await performance?.measureUserAgentSpecificMemory());
```

## BrowserPermission

Browser permission helpers

### Methods

- `supportedPermissions(): BrowserPermissionName[]`: list permissions supported by the utility.
- `getState(name: BrowserPermissionName): Promise<BrowserPermissionState>`: check the state of a browser permission.
- `request(name: BrowserPermissionName): Promise<BrowserPermissionState>`: request a browser permission.

### Examples

```ts
import { BrowserPermission } from '@trt-web/browser';
const current = await BrowserPermission.getState('geolocation');
console.log(BrowserPermission.supportedPermissions()); // ['geolocation', 'notifications', ...]
const requested = current === 'prompt' ? await BrowserPermission.request('geolocation') : current;
console.log(current); // 'granted' | 'denied' | 'prompt' | 'unsupported'
console.log(requested); // 'granted' when permission is granted
console.log(await BrowserPermission.request('notifications')); // 'prompt' when the browser returns 'default'
console.log(await BrowserPermission.request('geolocation')); // 'denied' when the user rejects access
```

## BrowserPresentation

Fullscreen and picture-in-picture helpers

### Methods

- `enterFullscreen(element?: Element): Promise<boolean>`: enter fullscreen mode for an element.
- `exitFullscreen(): Promise<boolean>`: exit fullscreen mode.
- `enterPictureInPicture(video: HTMLVideoElement): Promise<boolean>`: enter picture-in-picture mode for a video.
- `exitPictureInPicture(): Promise<boolean>`: exit picture-in-picture mode.

### Examples

```ts
import { BrowserPresentation } from '@trt-web/browser';
const entered = await BrowserPresentation.enterFullscreen(element);
const exited = await BrowserPresentation.exitFullscreen();
console.log({ entered, exited }); // { entered: true, exited: true }
console.log(await BrowserPresentation.enterFullscreen()); // false when fullscreen is unsupported
console.log(await BrowserPresentation.enterPictureInPicture(video)); // true
console.log(await BrowserPresentation.exitPictureInPicture()); // true
```

## BrowserResource

Browser resource loading and download helpers

### Methods

- `assetUrl(path: string): string`: resolve an asset path against the document base URL.
- `isCached(url: string, options?: BrowserResourceCacheOptions): Promise<boolean>`: check whether a browser resource is cached.
- `loadScript(src: string): Promise<HTMLScriptElement>`: load a script once and reuse concurrent requests.
- `loadLink(href: string): Promise<HTMLLinkElement>`: load a stylesheet once and reuse concurrent requests.
- `download(src: string | Blob | File, config?: BrowserResourceDownloadConfig): Promise<void>`: download a URL, Blob, or File in the current tab, or open it in a new tab.

### Examples

```ts
import { BrowserResource } from '@trt-web/browser';

await BrowserResource.loadScript('/assets/analytics.js');
await BrowserResource.loadLink('/assets/theme.css');

const cached = await BrowserResource.isCached('/assets/theme.css');

await BrowserResource.download('/exports/report.pdf', {
  name: 'monthly-report',
  ext: 'pdf',
  target: '_self',
  maxBlobSize: { value: 50, unit: 'Mb' },
});

console.log({ cached }); // { cached: true } when the resource is found in Cache Storage or has a zero transfer size
console.log(BrowserResource.assetUrl('assets/theme.css')); // 'https://example.com/app/assets/theme.css'

// For a URL with target '_self', HEAD checks Content-Length first.
// Small files are fetched as Blob; unknown or large files open in '_blank'.

await BrowserResource.download('/exports/report.pdf', {
  target: '_blank',
}); // opens the URL in a new tab; it does not force a download

const preview = new Blob(['Preview content'], { type: 'text/plain' });
await BrowserResource.download(preview, {
  target: '_blank',
}); // opens the Blob in a new tab
```

## BrowserScreen

Screen sharing and recording

### Methods

- `isSupported(): boolean`: check whether screen capture is supported.
- `startShare(options?: BrowserScreenStreamConstraints): Promise<MediaStream>`: start screen or window sharing.
- `stopShare(): boolean`: stop the current screen-sharing stream.
- `screenshot(config?: BrowserScreenScreenshotConfig): Promise<Blob | undefined>`: capture a frame from the shared screen.
- `createRecorder(options?: BrowserMediaRecorderOptions): Promise<BrowserMediaRecorderSession | undefined>`: create an independent recorder session for the shared screen.

### Examples

```ts
import { BrowserScreen } from '@trt-web/browser';
const screenshot = await BrowserScreen.screenshot({
  image: { type: 'image/png' },
});
console.log(screenshot?.size);

const video = document.querySelector<HTMLVideoElement>('#screen-preview')!;
const stream = await BrowserScreen.startShare();

if (stream) {
  video.srcObject = stream;

  const recorder = await BrowserScreen.createRecorder({ mimeType: 'video/webm' });
  recorder?.pause();
  recorder?.resume();

  const output = await recorder?.stop();
  console.log(output?.blob);

  BrowserScreen.stopShare();
}
```

## BrowserSpeechToText

Speech recognition helpers

### Methods

- `isSupported(): boolean`: check whether Speech Recognition is supported.
- `recognize(options?: BrowserSpeechToTextOptions): Promise<string | undefined>`: recognize speech using the configured language.

### Examples

```ts
import { BrowserSpeechToText } from '@trt-web/browser';
const text = await BrowserSpeechToText.recognize({
  lang: 'en-US',
  interimResults: true,
});
console.log(text);
```

## BrowserTextToSpeech

Speech synthesis helpers

### Methods

- `isSupported(): boolean`: check whether Speech Synthesis is supported.
- `speak(text: string, options?: BrowserTextToSpeechOptions): Promise<void>`: speak text using the selected voice and options.
- `getVoices(): Promise<SpeechSynthesisVoice[]>`: list available speech synthesis voices.
- `pause(): void`: pause current speech.
- `resume(): void`: resume paused speech.
- `cancel(): void`: cancel current speech.
- `isSpeaking(): boolean`: check whether speech is active.
- `isPaused(): boolean`: check whether speech is paused.

### Examples

```ts
import { BrowserTextToSpeech } from '@trt-web/browser';
await BrowserTextToSpeech.speak('Hello from the browser', { lang: 'en-US' });
console.log(BrowserTextToSpeech.isSpeaking());
```

## BrowserTabActivity

Tab visibility and focus helpers

### Methods

- `isSupported(): boolean`: check whether tab activity tracking is supported.
- `getState(): BrowserTabActivityState`: read the current focus and visibility state.
- `subscribe(handler: (state: BrowserTabActivityState) => void): BrowserSubscription`: listen for tab activity changes and return a subscription.
- `unsubscribe(): void`: remove the associated browser event listeners.

### Examples

```ts
import { BrowserTabActivity } from '@trt-web/browser';
const subscription = BrowserTabActivity.subscribe((state) => {
  console.log(state);
});
subscription.unsubscribe();
BrowserTabActivity.unsubscribe(); // remove any remaining tab subscriptions
```

## BrowserTheme

System theme observation

### Methods

- `isSupported(): boolean`: check whether system theme observation is supported.
- `getSystemTheme(): BrowserThemeMode`: read the system `dark` or `light` theme.
- `subscribe(handler: (theme: BrowserThemeMode) => void): BrowserSubscription`: listen for system theme changes and return a subscription.

### Examples

```ts
import { BrowserTheme } from '@trt-web/browser';
const applyTheme = (theme: 'dark' | 'light') => {
  document.documentElement.dataset['theme'] = theme;
};

applyTheme(BrowserTheme.getSystemTheme());
const subscription = BrowserTheme.subscribe((theme) => {
  applyTheme(theme);
});

subscription.unsubscribe();
```

## BrowserVibration

Vibration API helpers

### Methods

- `isSupported(): boolean`: check whether the Vibration API is supported.
- `vibrate(pattern: BrowserVibratePattern): boolean`: start a vibration pattern on the device.
- `cancel(): boolean`: cancel the current vibration.

### Examples

```ts
import { BrowserVibration } from '@trt-web/browser';
BrowserVibration.vibrate([200, 100, 200]);
BrowserVibration.cancel();
```

## BrowserViewport

Responsive viewport state helpers

### Methods

- `register(config: BrowserViewportConfig): void`: replace the global viewport range configuration.
- `getCurrentState(): BrowserViewportState`: read the current viewport size, orientation, and all matching ranges.
- `isInRange(range: BrowserViewportRangeName): boolean`: check whether a named range currently matches.
- `subscribe(handler: (state: BrowserViewportState) => void): BrowserSubscription`: listen to resize changes with an independent subscription.

### Examples

```ts
import { BrowserViewport } from '@trt-web/browser';

BrowserViewport.register({
  phone: { max: 599 },
  tablet: { min: 600, max: 1023 },
  desktop: { min: 1024 },
  wide: { min: 1440 },
});

console.log(BrowserViewport.getCurrentState());
// {
//   width: 1440,
//   height: 900,
//   orientation: 'landscape',
//   ranges: ['desktop', 'wide'],
// }

// Receive every viewport resize update.
const allSubscription = BrowserViewport.subscribe((state) => {
  console.log(state.width, state.height, state.ranges);
});

// Receive updates only while the viewport matches the tablet range.
const tabletSubscription = BrowserViewport.subscribe(
  (state) => {
    console.log('Tablet viewport:', state.width, state.height);
  },
  { range: 'tablet' },
);

console.log(BrowserViewport.isInRange('tablet')); // false

allSubscription.unsubscribe();
tabletSubscription.unsubscribe();
```

## BrowserWakeLock

Screen wake lock helpers

### Methods

- `isSupported(): boolean`: check whether the Screen Wake Lock API is supported.
- `isActive(): boolean`: check whether a screen wake lock is active.
- `enable(): Promise<boolean>`: request a screen wake lock.
- `disable(): Promise<void>`: release the active screen wake lock.

### Examples

```ts
import { BrowserWakeLock } from '@trt-web/browser';
await BrowserWakeLock.enable();
console.log(BrowserWakeLock.isActive());
await BrowserWakeLock.disable();
```

## BrowserWindow

Current window helpers

### Methods

- `reload(): void`: reload the current tab.
- `goBack(): void`: navigate backward in the current tab.
- `goForward(): void`: navigate forward in the current tab.
- `pushState(data: unknown, unused: string, url?: string | URL): void`: add a history entry without reloading the page.
- `replaceState(data: unknown, unused: string, url?: string | URL): void`: replace the current history entry without reloading the page.
- `historyState(): unknown`: read the current history state.
- `alert(message: string): void`: show a browser alert dialog.
- `confirm(message: string): boolean`: show a browser confirmation dialog.
- `prompt(title: string, defaultValue?: string): string | null`: show a browser prompt dialog.
- `print(): void`: open the browser print dialog.
- `preload(url: string, options?: BrowserWindowPreloadOptions): HTMLLinkElement | undefined`: preload a URL resource.
- `getKeyboardEventInfo(event: KeyboardEvent): BrowserKeyboardEventInfo`: extract keyboard event information.
- `getPointerEventInfo(event: PointerEvent): BrowserPointerEventInfo`: extract pointer event information.

### Examples

```ts
import { BrowserWindow } from '@trt-web/browser';
BrowserWindow.preload('/assets/app.js');
BrowserWindow.pushState({ section: 'settings' }, '', '/settings');
BrowserWindow.replaceState({ section: 'profile' }, '', '/profile');
console.log(BrowserWindow.historyState());
const confirmed = BrowserWindow.confirm('Continue?');
if (confirmed) {
  BrowserWindow.print();
}
// Call reload when the current page should be loaded again.
// BrowserWindow.reload();
```

## BrowserWindowManager

Child window lifecycle helpers

### Methods

- `open(config?: BrowserWindowOpenConfig): BrowserWindowInstance | null`: open a child browser window and return an instance for closing the window or listening to its lifecycle changes.

### Examples

```ts
import { BrowserWindowManager } from '@trt-web/browser';
const child = BrowserWindowManager.open({
  url: '/preview',
  target: 'preview-window',
  features: 'width=800,height=600,resizable=yes',
  title: 'Preview',
  pollInterval: 250,
});

if (!child) {
  console.log('The browser blocked the popup.');
} else {
  child.onFocus = () => {
    console.log('Preview focused.');
  };

  child.onBlur = () => {
    console.log('Preview lost focus.');
  };

  child.onResize = ({ width, height }) => {
    console.log('Preview resized:', width, height);
  };

  child.onZoomChange = ({ devicePixelRatio, direction }) => {
    console.log('Preview zoom changed:', direction, devicePixelRatio);
  };

  child.onClose = () => {
    console.log('Preview closed.');
  };

  child.close();
}

const result = await BrowserShare.share({
  title: 'Monthly report',
  text: 'The report is ready.',
  url: 'https://example.com/report',
});
console.log(result); // { permission: 'granted', data: { title: 'Monthly report', text: 'The report is ready.', url: 'https://example.com/report' }, success: true }
console.log(await BrowserShare.share({ text: 'Not shareable' })); // { permission: 'denied', success: false } when navigator.canShare() returns false
console.log(await BrowserShare.share({ text: 'Cancelled' })); // { permission: 'granted', success: false } when navigator.share() rejects
```

## Cookie

Cookie storage helpers

### Methods

- `isSupported(): boolean`: check whether cookies are supported and enabled.
- `set<T>(name: string, value: T, config?: CookieSetConfig): void`: store typed data in a cookie.
- `get<T>(name: string): T | undefined`: read typed data from a cookie.
- `remove(name: string, config?: CookieSetConfig): void`: remove a cookie.
- `clear(): void`: remove all accessible cookies.
- `exists(name: string): boolean`: check whether a cookie exists.

### Examples

```ts
import { Cookie } from '@trt-web/core';
Cookie.set('preferences', { theme: 'dark' }, { expiresIn: 7 });
const preferences = Cookie.get<{ theme: string }>('preferences');
console.log(preferences, Cookie.exists('preferences')); // { theme: 'dark' } true
Cookie.set('session', { active: true }, { expiresIn: { value: 1, unit: 'hour' } });
console.log(Cookie.get('session')); // { active: true }
Cookie.remove('preferences');
Cookie.clear();
console.log(Cookie.get('session')); // undefined
```

## LocalStorage

Local storage helpers

### Methods

- `isSupported(): boolean`: check whether `localStorage` is supported and available.
- `set<T>(key: string, value: T): void`: store typed data in `localStorage`.
- `get<T>(key: string): T | undefined`: read typed data from `localStorage`.
- `remove(key: string): void`: remove an item from `localStorage`.
- `clear(): void`: remove all items from `localStorage`.
- `exists(key: string): boolean`: check whether a key exists in `localStorage`.

### Examples

```ts
import { LocalStorage } from '@trt-web/core';
LocalStorage.set('profile', { id: 1, name: 'Alice' });
const profile = LocalStorage.get<{ id: number; name: string }>('profile');
console.log(profile, LocalStorage.exists('profile')); // { id: 1, name: 'Alice' } true
LocalStorage.remove('profile');
console.log(LocalStorage.get('profile')); // undefined
LocalStorage.clear();
```

## SessionStorage

Session storage helpers

### Methods

- `isSupported(): boolean`: check whether `sessionStorage` is supported and available.
- `set<T>(key: string, value: T): void`: store typed data in `sessionStorage`.
- `get<T>(key: string): T | undefined`: read typed data from `sessionStorage`.
- `remove(key: string): void`: remove an item from `sessionStorage`.
- `clear(): void`: remove all items from `sessionStorage`.
- `exists(key: string): boolean`: check whether a key exists in `sessionStorage`.

### Examples

```ts
import { SessionStorage } from '@trt-web/core';
SessionStorage.set('draft', { title: 'Untitled' });
console.log(SessionStorage.get('draft')); // { title: 'Untitled' }
console.log(SessionStorage.exists('draft')); // true
SessionStorage.remove('draft');
console.log(SessionStorage.get('draft')); // undefined
SessionStorage.clear();
```
