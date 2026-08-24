# @trt-web/core

- Shared building blocks for cleaner web apps

## Installation

- With NPM (or Yarn, Bun,...):

```bash
npm install @trt-web/core
```

## Public API

### Direct exports

- `BrowserClipboard`
  - `copy`: copy text to the clipboard.
  - `read`: read text from the clipboard.

  ```ts
  const copied = await BrowserClipboard.copy('Copied from the browser');
  const text = await BrowserClipboard.read();
  console.log(copied); // { permission: 'granted', data: 'Copied from the browser', success: true }
  console.log(text); // 'Copied from the browser'

  const blocked = await BrowserClipboard.copy('Blocked text');
  console.log(blocked); // { permission: 'denied', success: false }
  ```

- `BrowserEnvironment`
  - `getLocale`: get the user's preferred locale.
  - `getInformation`: get browser environment, hardware, battery, storage, screen, or all information.

  ```ts
  import { BrowserEnvironment } from '@trt-web/core';

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

- `BrowserLocation`
  - `getLocation`: get the current geolocation with permission handling and speed presets.

  ```ts
  const location = await BrowserLocation.getLocation({ speed: 'fast' });
  console.log(location); // { permission: 'granted', data: { coords: { latitude: 5, longitude: 6 } }, success: true }
  console.log(await BrowserLocation.getLocation({ speed: 'accurate' })); // { permission: 'granted', data: { coords: { latitude: 3, longitude: 4 } }, success: true }
  console.log(await BrowserLocation.getLocation()); // { permission: 'unsupported', success: false } when geolocation is unavailable
  ```

- `BrowserPermission`
  - `getState`: check the state of a browser permission.
  - `request`: request a browser permission.

  ```ts
  const current = await BrowserPermission.getState('geolocation');
  const requested = current === 'prompt' ? await BrowserPermission.request('geolocation') : current;
  console.log(current); // 'granted' | 'denied' | 'prompt' | 'unsupported'
  console.log(requested); // 'granted' when permission is granted
  console.log(await BrowserPermission.request('notifications')); // 'prompt' when the browser returns 'default'
  console.log(await BrowserPermission.request('geolocation')); // 'denied' when the user rejects access
  ```

- `BrowserPresentation`
  - `enterFullscreen`: enter fullscreen mode for an element.
  - `exitFullscreen`: exit fullscreen mode.
  - `enterPictureInPicture`: enter picture-in-picture mode for a video.
  - `exitPictureInPicture`: exit picture-in-picture mode.

  ```ts
  const entered = await BrowserPresentation.enterFullscreen(element);
  const exited = await BrowserPresentation.exitFullscreen();
  console.log({ entered, exited }); // { entered: true, exited: true }
  console.log(await BrowserPresentation.enterFullscreen()); // false when fullscreen is unsupported
  console.log(await BrowserPresentation.enterPictureInPicture(video)); // true
  console.log(await BrowserPresentation.exitPictureInPicture()); // true
  ```

- `BrowserResource`
  - `assetUrl`: resolve an asset path against the document base URL.
  - `isCached`: check whether a browser resource is cached.
  - `loadScript`: load a script once and reuse concurrent requests.
  - `loadLink`: load a stylesheet once and reuse concurrent requests.
  - `download`: download a URL, Blob, or File in the current tab, or open it in a new tab.

  ```ts
  import { BrowserResource } from '@trt-web/core';

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

  `target: '_self'` is the download mode. For URL sources, the method first
  checks `Content-Length` with `HEAD`; it fetches the resource as a Blob only
  when the size is within `maxBlobSize` (default: `{ value: 50, unit: 'Mb' }`).
  If the size cannot be determined or is too large, the original URL opens in
  a new tab. Cross-origin URL checks require CORS support from the server.

  `target: '_blank'` is the preview mode. It always uses `window.open()` for
  URL, `Blob`, and `File` sources, so the `download` attribute is not applied.

- `BrowserAudioContext`
  - `isSupported`: check whether the Web Audio API is supported.
  - `getInstance`: get the shared audio context manager.
  - `ready`: resume the audio context when required.
  - `getState`: read the current AudioContext state.
  - `suspend`: suspend all audio processing in the shared context.
  - `resume`: resume all audio processing in the shared context.
  - `decodeAudioData`: decode an ArrayBuffer into an AudioBuffer.
  - `createAudioSession`: create an isolated audio playback session.
  - `playTone`: play a sequence of oscillator tones.
  - `close`: close the shared audio context.

  ```ts
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
  ```

- `BrowserAudioSession`
  - `play`: play the audio buffer from the current position.
  - `pause`: pause playback and preserve the current position.
  - `resume`: resume playback from the paused position.
  - `stop`: stop playback and reset the position to the beginning.
  - `createAnalyser`: create an analyser for realtime audio data.
  - `getWaveformData`: get waveform peaks from the audio buffer.
  - `getFrequencyData`: get current frequency-domain data.
  - `getTimeDomainData`: get current time-domain data.

  ```ts
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

- `BrowserBattery`
  - `isSupported`: check whether the Battery Status API is available.
  - `getState`: read the current charging status, battery percentage, and estimated times.
  - `subscribe`: listen for charging, level, charging-time, and discharging-time changes.

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

  `chargingTimeSeconds` and `dischargingTimeSeconds` are measured in seconds.
  An unavailable infinite discharging time is normalized to
  `Number.MAX_SAFE_INTEGER`.

- `BrowserAI`
  - `isSupported`: check whether at least one supported built-in browser AI API is available.
  - `isLanguageDetectorSupported`: check whether the Language Detector API is available.
  - `isSummarizerSupported`: check whether the Summarizer API is available.
  - `isTranslatorSupported`: check whether the Translator API is available.
  - `supportedFeatures`: return support status for each built-in AI feature.
  - `detectAvailability`: read Language Detector availability.
  - `summarizeAvailability`: read Summarizer availability for the requested options.
  - `translateAvailability`: read Translator availability for a language pair.
  - `detectLanguage`: detect languages and confidence scores from text.
  - `summarize`: summarize text with the selected format and length.
  - `translate`: translate text between the selected source and target languages.
  - `onProgress`: optional callback in `detectLanguage`, `summarize` and `translate`; receives `{ phase, progress }`, where `phase` is `downloading`, `processing` or `done`, and `progress` is between `0` and `1`.

  ```ts
  onProgress: ({ phase, progress }) => {
    console.log(phase, `${Math.round(progress * 100)}%`);
  };
  // Output: downloading 50%
  // Output: processing 0%
  // Output: done 100%
  ```

  ```ts
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

- `BrowserBluetooth`
  - `isSupported`: check whether Web Bluetooth is supported.
  - `isAvailable`: check whether Bluetooth is currently available.
  - `getPairedDevices`: list previously permitted Bluetooth devices.
  - `requestDevice`: request a Bluetooth device from the user.
  - `connect`: connect to the device's GATT server.
  - `disconnect`: disconnect from the current GATT server.
  - `isConnected`: check whether a GATT server is connected.
  - `getPrimaryService`: get a primary GATT service.
  - `getCharacteristic`: get a characteristic from a service.
  - `getCharacteristics`: list characteristics from a service.
  - `readValue`: read a characteristic value.
  - `writeValue`: write a value to a characteristic.
  - `startNotifications`: listen for characteristic value changes.
  - `stopNotifications`: stop characteristic notifications.

  ```ts
  const device = await BrowserBluetooth.requestDevice({
    filters: [{ services: ['heart_rate'] }],
  });
  await BrowserBluetooth.connect(device);
  const value = await BrowserBluetooth.readValue({
    service: 'heart_rate',
    characteristic: 'heart_rate_measurement',
  });
  await BrowserBluetooth.disconnect();
  console.log(value);
  ```

- `BrowserFileSystem`
  - `isSupported`: check whether the File System Access API is supported.
  - `openFile`: open one or more file handles from the device.
  - `readFile`: open and read one file.
  - `readFiles`: open and read multiple files.
  - `readText`: read text from an existing file handle.
  - `readArrayBuffer`: read binary data from an existing file handle.
  - `saveFile`: save data through the file picker.
  - `openDirectory`: open a directory handle.
  - `listDirectory`: list files and directories from a directory handle.
  - `getOpfsRoot`: get the origin private file system root.
  - `writeText`: replace a file's text contents.
  - `appendText`: append text to a file.
  - `removeEntry`: remove a file or directory entry.
  - `requestPermission`: query and request access to a file or directory handle.

  ```ts
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

- `BrowserCamera`
  - `isSupported`: check whether camera capture is supported.
  - `facingModes`: detect available camera facing modes.
  - `listDevices`: list available camera devices.
  - `turnOn`: request and start a camera stream.
  - `turnOff`: stop the current camera stream.
  - `currentStream`: get the current camera stream.
  - `isStreamActive`: check whether the current camera stream is active.
  - `createRecorder`: create an independent recorder session for the camera stream.

  ```ts
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

- `BrowserMicrophone`
  - `isSupported`: check whether microphone capture is supported.
  - `listDevices`: list available microphone devices.
  - `turnOn`: request and start a microphone stream.
  - `turnOff`: stop the current microphone stream.
  - `currentStream`: get the current microphone stream.
  - `isStreamActive`: check whether the current microphone stream is active.
  - `createRecorder`: create an independent recorder session for the microphone stream.

  ```ts
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

- `BrowserScreen`
  - `isSupported`: check whether screen capture is supported.
  - `startShare`: start screen or window sharing.
  - `stopShare`: stop the current screen-sharing stream.
  - `screenshot`: capture a frame from the shared screen.
  - `currentStream`: get the current screen-sharing stream.
  - `isStreamActive`: check whether the current screen-sharing stream is active.
  - `createRecorder`: create an independent recorder session for the shared screen.

  ```ts
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

- `BrowserMediaRecorderSession`
  - Created and returned by `BrowserCamera.createRecorder()`, `BrowserMicrophone.createRecorder()`, or `BrowserScreen.createRecorder()`.
  - `recorderInstance`: access the underlying browser `MediaRecorder` instance.
  - `state`: read the current recorder state.
  - `mimeType`: read the recorder MIME type.
  - `isRecording`: check whether recording is active.
  - `isPaused`: check whether recording is paused.
  - `isInactive`: check whether recording is inactive.
  - `pause`: pause the current recording session.
  - `resume`: resume the current recording session.
  - `requestData`: request the current recording data chunk.
  - `stop`: stop the recording and return the recorded `Blob` result.

- `BrowserNetwork`
  - `isSupported`: check whether network information is available.
  - `getState`: read online status and connection information.
  - `subscribe`: listen for network changes and return a subscription.

  ```ts
  const subscription = BrowserNetwork.subscribe((state) => {
    console.log(state.status, state.effectiveType);
  });

  subscription.unsubscribe();
  ```

- `BrowserViewport`
  - `register`: replace the global viewport range configuration.
  - `getCurrentState`: read the current viewport size, orientation, and all matching ranges.
  - `isInRange`: check whether a named range currently matches.
  - `subscribe`: listen to resize changes with an independent subscription.

  ```ts
  import { BrowserViewport } from '@trt-web/core';

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

  The `range` option filters callback notifications; it does not change the
  viewport state returned by the callback. Omit it when the subscriber should
  receive every resize update.

- `BrowserNfc`
  - `isSupported`: check whether Web NFC is supported.
  - `isScanning`: check whether NFC scanning is active.
  - `startScan`: start reading NFC messages.
  - `stopScan`: stop NFC scanning.
  - `write`: write an NFC message.

  ```ts
  await BrowserNfc.startScan({
    onReading: (event) => console.log(event.message),
  });
  await BrowserNfc.write({ records: [{ recordType: 'text', data: 'Hello NFC' }] });
  BrowserNfc.stopScan();
  ```

- `BrowserPeerConnection`
  - `isSupported`: check secure-context WebRTC support.
  - `isConnected`: check whether the peer connection is connected.
  - `createPeerConnection`: create and configure a peer connection.
  - `createDataChannel`: create a data channel.
  - `createOffer`: create an SDP offer.
  - `createAnswer`: create an SDP answer.
  - `setLocalDescription`: set the local SDP description.
  - `setRemoteDescription`: set the remote SDP description.
  - `addIceCandidate`: add a remote ICE candidate.
  - `getStats`: read connection statistics.
  - `restartIce`: request an ICE restart.
  - `close`: close the peer connection and remove listeners.

  This utility wraps the browser `RTCPeerConnection` API only. It does not provide
  signaling, ICE candidate exchange, STUN/TURN infrastructure or reconnection logic.
  A real peer-to-peer application must provide those pieces separately.

  ```ts
  BrowserPeerConnection.createPeerConnection({
    config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] },
    handlers: { onIceCandidate: (event) => console.log(event.candidate) },
  });
  const offer = await BrowserPeerConnection.createOffer();
  await BrowserPeerConnection.setLocalDescription(offer);
  BrowserPeerConnection.close();
  ```

- `BrowserSpeechToText`
  - `isSupported`: check whether Speech Recognition is supported.
  - `recognize`: recognize speech using the configured language.

  ```ts
  const text = await BrowserSpeechToText.recognize({
    lang: 'en-US',
    interimResults: true,
  });
  console.log(text);
  ```

- `BrowserTextToSpeech`
  - `isSupported`: check whether Speech Synthesis is supported.
  - `speak`: speak text using the selected voice and options.
  - `getVoices`: list available speech synthesis voices.
  - `pause`: pause current speech.
  - `resume`: resume paused speech.
  - `cancel`: cancel current speech.
  - `isSpeaking`: check whether speech is active.
  - `isPaused`: check whether speech is paused.

  ```ts
  await BrowserTextToSpeech.speak('Hello from the browser', { lang: 'en-US' });
  console.log(BrowserTextToSpeech.isSpeaking());
  ```

- `BrowserTabActivity`
  - `isSupported`: check whether tab activity tracking is supported.
  - `getState`: read the current focus and visibility state.
  - `subscribe`: listen for tab activity changes and return a subscription.

  ```ts
  const subscription = BrowserTabActivity.subscribe((state) => {
    console.log(state);
  });
  subscription.unsubscribe();
  ```

- `BrowserTheme`
  - `isSupported`: check whether system theme observation is supported.
  - `getSystemTheme`: read the system `dark` or `light` theme.
  - `subscribe`: listen for system theme changes and return a subscription.

  ```ts
  const applyTheme = (theme: 'dark' | 'light') => {
    document.documentElement.dataset['theme'] = theme;
  };

  applyTheme(BrowserTheme.getSystemTheme());
  const subscription = BrowserTheme.subscribe((theme) => {
    applyTheme(theme);
  });

  subscription.unsubscribe();
  ```

- `BrowserVibration`
  - `isSupported`: check whether the Vibration API is supported.
  - `vibrate`: start a vibration pattern on the device.
  - `cancel`: cancel the current vibration.

  ```ts
  BrowserVibration.vibrate([200, 100, 200]);
  BrowserVibration.cancel();
  ```

- `BrowserWakeLock`
  - `isSupported`: check whether the Screen Wake Lock API is supported.
  - `isActive`: check whether a screen wake lock is active.
  - `enable`: request a screen wake lock.
  - `disable`: release the active screen wake lock.

  ```ts
  await BrowserWakeLock.enable();
  console.log(BrowserWakeLock.isActive());
  await BrowserWakeLock.disable();
  ```

- `BrowserWindow`
  - `goBack`: navigate backward in the current tab.
  - `goForward`: navigate forward in the current tab.
  - `alert`: show a browser alert dialog.
  - `confirm`: show a browser confirmation dialog.
  - `prompt`: show a browser prompt dialog.
  - `print`: open the browser print dialog.
  - `preload`: preload a URL resource.
  - `getKeyboardEventInfo`: extract keyboard event information.
  - `getPointerEventInfo`: extract pointer event information.

  ```ts
  BrowserWindow.preload('/assets/app.js');
  const confirmed = BrowserWindow.confirm('Continue?');
  if (confirmed) {
    BrowserWindow.print();
  }
  ```

- `BrowserWindowManager`
  - `open`: open a child browser window and return an instance for closing the window or listening to its lifecycle changes.

  ```ts
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
  ```

  Set only the callbacks your app needs. Resize and zoom changes are monitored
  using the configured `pollInterval`, while focus and blur use child-window
  events. Cross-origin child windows may restrict access to their document and
  event listeners.

- Browser worker utilities
  - `createWorker`: create a worker from a reusable function.
  - `runWorker`: run a function in a worker and await its result.

- `BrowserShare`
  - `share`: share content through the Web Share API.

  ```ts
  const result = await BrowserShare.share({
    title: 'Monthly report',
    text: 'The report is ready.',
    url: 'https://example.com/report',
  });
  console.log(result); // { permission: 'granted', data: { title: 'Monthly report', text: 'The report is ready.', url: 'https://example.com/report' }, success: true }
  console.log(await BrowserShare.share({ text: 'Not shareable' })); // { permission: 'denied', success: false } when navigator.canShare() returns false
  console.log(await BrowserShare.share({ text: 'Cancelled' })); // { permission: 'granted', success: false } when navigator.share() rejects
  ```

- `IndexedDB`
  - `isSupported`: check whether IndexedDB is available in the browser.
  - `register`: register a database, its version, and its collections.
  - `databases`: list databases available on the current origin.
  - `collection`: get a typed singleton collection instance from a registered database.
  - `add`: add a new item to the collection.
  - `put`: add or replace an item by its `id`.
  - `get`: read an item by its `id`.
  - `getAll`: read all items from the collection.
  - `remove`: remove an item by its `id`.
  - `clear`: remove all items from the collection.

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

Register the database before using its collections. Increase `version` when
adding collections or changing the database schema.

- `Cookie`
  - `isSupported`: check whether cookies are supported and enabled.
  - `set`: store typed data in a cookie.
  - `get`: read typed data from a cookie.
  - `remove`: remove a cookie.
  - `clear`: remove all accessible cookies.
  - `exists`: check whether a cookie exists.

  ```ts
  Cookie.set('preferences', { theme: 'dark' }, { expiresIn: 7 });
  const preferences = Cookie.get<{ theme: string }>('preferences');
  console.log(preferences, Cookie.exists('preferences')); // { theme: 'dark' } true
  Cookie.set('session', { active: true }, { expiresIn: { value: 1, unit: 'hour' } });
  console.log(Cookie.get('session')); // { active: true }
  Cookie.remove('preferences');
  Cookie.clear();
  console.log(Cookie.get('session')); // undefined
  ```

- `LocalStorage`
  - `isSupported`: check whether `localStorage` is supported and available.
  - `set`: store typed data in `localStorage`.
  - `get`: read typed data from `localStorage`.
  - `remove`: remove an item from `localStorage`.
  - `clear`: remove all items from `localStorage`.
  - `exists`: check whether a key exists in `localStorage`.

  ```ts
  LocalStorage.set('profile', { id: 1, name: 'Alice' });
  const profile = LocalStorage.get<{ id: number; name: string }>('profile');
  console.log(profile, LocalStorage.exists('profile')); // { id: 1, name: 'Alice' } true
  LocalStorage.remove('profile');
  console.log(LocalStorage.get('profile')); // undefined
  LocalStorage.clear();
  ```

- `SessionStorage`
  - `isSupported`: check whether `sessionStorage` is supported and available.
  - `set`: store typed data in `sessionStorage`.
  - `get`: read typed data from `sessionStorage`.
  - `remove`: remove an item from `sessionStorage`.
  - `clear`: remove all items from `sessionStorage`.
  - `exists`: check whether a key exists in `sessionStorage`.

  ```ts
  SessionStorage.set('draft', { title: 'Untitled' });
  console.log(SessionStorage.get('draft')); // { title: 'Untitled' }
  console.log(SessionStorage.exists('draft')); // true
  SessionStorage.remove('draft');
  console.log(SessionStorage.get('draft')); // undefined
  SessionStorage.clear();
  ```

### trt.browser

- `createWorker`: create a Web Worker from a function.

  ```ts
  const worker = trt.browser.createWorker((value: number) => value * 2);
  worker.terminate();
  console.log(worker instanceof Worker); // true
  ```

- `runWorker`: run a function in a Web Worker and resolve its result.

  ```ts
  const sum = await trt.browser.runWorker(
    (values: number[]) => values.reduce((total, value) => total + value, 0),
    [2, 3],
  );
  console.log(sum); // 5
  ```

### trt.date

- `generateTimestamp`: generate a timestamp value.

  ```ts
  console.log(trt.date.generateTimestamp()); // '2026-07-25T...Z'
  ```

- `getDateRange`: resolve common preset ranges and dynamic ranges into `startDate` / `endDate`.

  ```ts
  const range = trt.date.getDateRange('this_week', new Date('2026-07-03T17:00:00.000Z'));
  console.log(range); // { startDate: '2026-06-29', endDate: '2026-07-03' }
  console.log(
    trt.date.getDateRange({ value: 3, unit: 'day' }, new Date('2026-07-03T17:00:00.000Z')),
  ); // { startDate: '2026-06-30', endDate: '2026-07-03' }
  console.log(trt.date.getDateRange('last_7_days', new Date('2026-07-03T17:00:00.000Z'))); // { startDate: '2026-06-27', endDate: '2026-07-03' }
  console.log(trt.date.getDateRange('today', new Date('2026-07-03T17:00:00.000Z'))); // { startDate: '2026-07-03', endDate: '2026-07-03' }
  console.log(trt.date.getDateRange('yesterday', new Date('2026-07-03T17:00:00.000Z'))); // { startDate: '2026-07-02', endDate: '2026-07-03' }
  console.log(trt.date.getDateRange('last_30_days', new Date('2026-07-03T17:00:00.000Z'))); // { startDate: '2026-06-04', endDate: '2026-07-03' }
  console.log(trt.date.getDateRange('this_month', new Date('2026-07-03T17:00:00.000Z'))); // { startDate: '2026-07-01', endDate: '2026-07-03' }
  console.log(trt.date.getDateRange('this_year', new Date('2026-07-03T17:00:00.000Z'))); // { startDate: '2026-01-01', endDate: '2026-07-03' }
  console.log(
    trt.date.getDateRange({ value: 2, unit: 'week' }, new Date('2026-07-03T17:00:00.000Z')),
  ); // { startDate: '2026-06-19', endDate: '2026-07-03' }
  console.log(
    trt.date.getDateRange({ value: 1, unit: 'month' }, new Date('2026-07-03T17:00:00.000Z')),
  ); // { startDate: '2026-06-03', endDate: '2026-07-03' }
  console.log(
    trt.date.getDateRange({ value: 1, unit: 'year' }, new Date('2026-07-03T17:00:00.000Z')),
  ); // { startDate: '2025-07-03', endDate: '2026-07-03' }
  ```

### trt.dom

- `Canvas`
  - `isSupported`: check whether the HTML Canvas API is available.
  - `createSession`: create an isolated `CanvasSession` for a canvas element.

- `CanvasSession`
  - `getContext`: get the session's 2D rendering context.
  - `getSize`: read the canvas backing-store size.
  - `resize`: resize the canvas, optionally fitting its element or parent and applying device-pixel-ratio scaling.
  - `clear`: clear the canvas and optionally fill it with a color.
  - `drawLine`: draw a line with stroke options.
  - `drawRectangle`: draw a filled and/or stroked rectangle.
  - `drawCircle`: draw a filled and/or stroked circle.
  - `drawText`: draw text with font and alignment options.
  - `drawImage`: draw an image source at a position and optional size.
  - `getImageData`: read pixel data from a rectangular area.
  - `putImageData`: write pixel data to the canvas.
  - `createGradient`: create a linear or radial gradient.
  - `drawPath`: draw or fill a `Path2D` path.
  - `rotate`: rotate the current drawing transform.
  - `scale`: scale the current drawing transform.
  - `translate`: translate the current drawing transform.
  - `flip`: flip the current drawing transform horizontally or vertically.
  - `resetTransform`: reset the current drawing transform.
  - `toBlob`: export the canvas as a `Blob`.
  - `toDataUrl`: export the canvas as a data URL.

  ```ts
  import { Canvas } from '@trt-web/core';

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
  session.drawRectangle({ fillStyle: gradient, height: 80, width: 240, x: 40, y: 140 });

  const path = new Path2D();
  path.moveTo(40, 260);
  path.lineTo(160, 190);
  path.lineTo(280, 260);
  path.closePath();
  session.drawPath(path, { fillStyle: '#1e3a5f', strokeStyle: '#7dd3fc', lineWidth: 2 });

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

- `generateRandomColor`: generate a random color value.

  ```ts
  const color = trt.dom.generateRandomColor({ format: 'rgb', opacity: 0.5 });
  console.log(color); // 'rgba(36, 149, 97, 0.5)' (random RGB values)
  console.log(trt.dom.generateRandomColor({ format: 'hex', opacity: 0.5 })); // '#RRGGBBAA' (8-character lowercase hex)
  console.log(trt.dom.generateRandomColor()); // '#RRGGBB' (lowercase random hex color)
  console.log(trt.dom.generateRandomColor({ format: 'rgb' })); // 'rgb(R, G, B)'
  ```

- `getElementInfo`: read size and position details from an element.

  ```ts
  const info = trt.dom.getElementInfo(document.querySelector('#app')!);
  console.log(info); // { width: 640, height: 480, top: 0, left: 0, right: 640, bottom: 480 }
  ```

- `varCSS`: read/write CSS custom property values.

  ```ts
  trt.dom.varCSS('--brand-color', '#2563eb'); // set value
  console.log(trt.dom.varCSS('--brand-color')); // '#2563eb'
  ```

### trt.file

- `compressImageFile`: compress and resize image files.

  ```ts
  const file = input.files?.[0];
  if (file) {
    const compressed = await trt.file.compressImageFile(file, {
      maxWidth: 1200,
      quality: 0.8,
    });
    console.log(compressed instanceof File, compressed.type); // true 'image/jpeg'
  }
  ```

- `convertFileSize`: convert file size values between byte units.

  ```ts
  console.log(trt.file.convertFileSize(1024, 'byte:kb')); // 1
  console.log(trt.file.convertFileSize(2, 'Gb:Mb')); // 2048
  console.log(trt.file.convertFileSize(1.5, 'Mb:byte')); // 1572864
  console.log(trt.file.convertFileSize(1, 'Mb:Gb', { decimalPlaces: 4 })); // 0.001
  try {
    trt.file.convertFileSize(Number.POSITIVE_INFINITY, 'byte:kb');
  } catch (error) {
    console.log((error as Error).message); // 'value must be a finite number'
  }
  ```

- `fileToDataUrl`: convert a file to a data URL.

  ```ts
  const file = input.files?.[0];
  if (file) {
    const dataUrl = await trt.file.fileToDataUrl(file);
    console.log(dataUrl.startsWith('data:')); // true
  }
  ```

- `fileToObjectUrl`: convert a file to an object URL.

  ```ts
  const file = input.files?.[0];
  if (file) {
    const objectUrl = trt.file.fileToObjectUrl(file);
    console.log(objectUrl.startsWith('blob:')); // true
    URL.revokeObjectURL(objectUrl);
  }
  ```

- `getImageSize`: inspect image dimensions.

  ```ts
  console.log(await trt.file.getImageSize('/assets/photo.jpg')); // { width: 1920, height: 1080 } for a 1920x1080 image
  ```

- `loadImage`: load an image element from a source.

  ```ts
  const image = await trt.file.loadImage('/assets/photo.jpg');
  console.log(image instanceof HTMLImageElement, image.complete); // true true
  ```

### trt.number

- `calcBayesianRating`: calculate a Bayesian-style rating using a global average prior.

  ```ts
  console.log(
    trt.number.calcBayesianRating({
      ratingAvg: 4.5,
      ratingCount: 6,
      globalAvg: 3.5,
      minimumVotesThreshold: 2,
    }),
  ); // 4.25
  console.log(trt.number.calcBayesianRating({ ratingAvg: 4.8, ratingCount: 0, globalAvg: 3.6 })); // 3.6
  console.log(trt.number.calcBayesianRating({ ratingAvg: 5, ratingCount: 1, globalAvg: 3 })); // 3.182
  ```

- `calcHaversineDistance`: calculate distance between two latitude/longitude points.

  ```ts
  console.log(
    trt.number.calcHaversineDistance(
      { latitude: 36.12, longitude: -86.67 },
      { latitude: 33.94, longitude: -118.4 },
    ),
  ); // 2886.444 (km, approximately)
  console.log(
    trt.number.calcHaversineDistance(
      { latitude: 10.123, longitude: 106.456 },
      { latitude: 10.123, longitude: 106.456 },
    ),
  ); // 0
  ```

- `calcSimpleBayesianRating`: calculate a weighted rating without a prior.

  ```ts
  console.log(
    trt.number.calcSimpleBayesianRating({
      ratingAvg: 4.8,
      ratingCount: 12,
      minimumVotesThreshold: 8,
    }),
  ); // 2.88
  console.log(trt.number.calcSimpleBayesianRating({ ratingAvg: 4.8, ratingCount: 0 })); // 0
  ```

- `formatViewCount`: format a view count into compact notation like `1.2k`.

  ```ts
  console.log(trt.number.formatViewCount(1000)); // '1k'
  console.log(trt.number.formatViewCount(1234)); // '1.2k'
  console.log(trt.number.formatViewCount(999)); // '999'
  console.log(trt.number.formatViewCount(1250, { decimalPlaces: 2 })); // '1.25k'
  console.log(trt.number.formatViewCount(1250, { decimalPlaces: 0 })); // '1k'
  console.log(trt.number.formatViewCount(1_250_000)); // '1.3m'
  console.log(trt.number.formatViewCount(2_500_000, { uppercase: true })); // '2.5M'
  console.log(trt.number.formatViewCount(2_500_000_000)); // '2.5b'
  ```

- `generateRandomNumber`: generate integer or decimal numbers in a range.

  ```ts
  console.log(trt.number.generateRandomNumber(1, 10)); // integer from 1 to 10
  console.log(trt.number.generateRandomNumber(1, 2, { decimal: true, decimalPlaces: 3 })); // decimal from 1.000 to 2.000
  try {
    trt.number.generateRandomNumber(1.2, 3);
  } catch (error) {
    console.log((error as Error).message); // 'min and max must be integers'
  }
  ```

### trt.object

- `cleanObj`: remove empty values from objects and nested structures.

  ```ts
  console.log(trt.object.cleanObj({ name: 'Alice', empty: '', value: null })); // { name: 'Alice' }
  console.log(
    trt.object.cleanObj({
      a: undefined,
      d: 0,
      e: false,
      nested: { value: null, name: 'Alice' },
    }),
  ); // { d: 0, e: false, nested: { name: 'Alice' } }
  console.log(trt.object.cleanObj({ a: null, b: undefined, c: '' })); // {}
  const circular: Record<string, unknown> = {};
  circular.self = circular;
  try {
    trt.object.cleanObj(circular);
  } catch (error) {
    console.log((error as Error).message); // 'Circular reference detected'
  }
  ```

- `removeDuplicateObjects`: deduplicate object arrays while preserving structure.

  ```ts
  console.log(trt.object.removeDuplicateObjects([{ id: 1 }, { id: 1 }, { id: 2 }])); // [{ id: 1 }, { id: 2 }]
  console.log(
    trt.object.removeDuplicateObjects(
      [
        { id: 1, name: 'A' },
        { id: 1, name: 'B' },
        { id: 2, name: 'C' },
      ],
      (item) => String(item.id),
    ),
  ); // [{ id: 1, name: 'A' }, { id: 2, name: 'C' }]
  ```

### trt.timing

- `debounce`: debounce function calls.

  ```ts
  const search = trt.timing.debounce((keyword: string) => {
    return keyword.toUpperCase();
  }, 300);
  search('indexed database');
  console.log(search.pending()); // true
  console.log(search.flush()); // 'INDEXED DATABASE'
  search.cancel();
  console.log(search.pending()); // false

  const leadingSearch = trt.timing.debounce(
    (keyword: string) => {
      return keyword.toUpperCase();
    },
    300,
    {
      leading: true,
      trailing: false,
    },
  );
  console.log(leadingSearch('first')); // 'FIRST'
  ```

- `throttle`: throttle function calls.

  ```ts
  const handleScroll = trt.timing.throttle(() => {
    console.log(window.scrollY);
  }, 100);
  console.log(handleScroll()); // current window.scrollY value
  console.log(handleScroll.pending()); // true or false, depending on the throttle window
  handleScroll.cancel();

  const trailing = trt.timing.throttle(
    (value: string) => {
      return value;
    },
    100,
    {
      leading: false,
      trailing: true,
    },
  );
  trailing('queued');
  console.log(trailing.pending()); // true
  console.log(trailing.flush()); // undefined; callback receives 'queued'
  ```

- `wait`: pause execution for a duration.

  ```ts
  await trt.timing.wait({ value: 10, unit: 'millisecond' });
  console.log('ready'); // 'ready' (after at least 10 ms)
  ```

### trt.string

- `capitalize`: capitalize a string or selected string fields in an object.

  ```ts
  const profile = {
    firstName: 'alice',
    lastName: 'nguyen van an',
    bio: 'frontend developer',
    age: 30,
  };

  console.log(trt.string.capitalize('hello')); // 'Hello' (string mode defaults to 'first')
  console.log(trt.string.capitalize('hello world', { mode: 'first' })); // 'Hello world'
  console.log(trt.string.capitalize('hello world', { mode: 'words' })); // 'Hello World'
  console.log(trt.string.capitalize(profile)); // same object values; no fields selected
  console.log(trt.string.capitalize(profile, { first: ['firstName'] })); // { firstName: 'Alice', lastName: 'nguyen van an', bio: 'frontend developer', age: 30 }
  console.log(trt.string.capitalize(profile, { words: ['lastName', 'bio'] })); // { firstName: 'alice', lastName: 'Nguyen Van An', bio: 'Frontend Developer', age: 30 }

  const article = {
    title: 'hello world',
    author: 'alice nguyen',
    summary: '',
  };
  console.log(trt.string.capitalize(article, { first: ['title'], words: ['author'] })); // { title: 'Hello world', author: 'Alice Nguyen', summary: '' }
  console.log(trt.string.capitalize({ title: null }, { first: ['title'] })); // { title: '' }
  ```

- `generateHash`: create a hash string.

  ```ts
  console.log(await trt.string.generateHash('hello')); // '5aa762ae383fbb727af3c7a36d4940a5b8c40a989452d2304fc958ff3f354e7a'
  ```

- `generateId`: generate a unique identifier.

  ```ts
  console.log(trt.string.generateId().length); // 36 (UUID string)
  ```

- `generateRandomString`: generate a random string.

  ```ts
  console.log(trt.string.generateRandomString(8).length); // 8
  ```

- `generateSearchKeys`: build searchable prefixes and tokens from text.

  ```ts
  console.log(trt.string.generateSearchKeys('Đắk Lắk')); // ['da', 'dak', 'dak ', 'dak l', 'dak la', 'dak lak', 'dl', 'la', 'lak']
  console.log(trt.string.generateSearchKeys('中文 😀')); // []
  console.log(
    trt.string.generateSearchKeys('Café', {
      minPrefixLength: 1,
      includePhrasePrefixes: false,
      includeAcronym: false,
    }),
  ); // ['c', 'ca', 'caf', 'cafe']
  console.log(
    trt.string.generateSearchKeys('Café', {
      minPrefixLength: 1,
      maxPrefixLength: 2,
      includePhrasePrefixes: false,
      includeAcronym: false,
    }),
  ); // ['c', 'ca', 'cafe']
  console.log(trt.string.generateSearchKeys('Đắk Lắk', { includePhrasePrefixes: false })); // ['da', 'dak', 'dak lak', 'dl', 'la', 'lak']
  console.log(trt.string.generateSearchKeys('Đắk Lắk', { includeAcronym: false })); // ['da', 'dak', 'dak ', 'dak l', 'dak la', 'dak lak', 'la', 'lak']
  ```

- `generateSortOrderKey`: generate a sortable order key for drag-and-drop style ordering.

  ```ts
  type SortableItem = {
    id: number;
    name: string;
    sortKey: string;
  };

  const items: SortableItem[] = [
    {
      id: 1,
      name: 'Item 1',
      sortKey: trt.string.generateSortOrderKey(),
    },
  ];

  for (let id = 2; id <= 10; id += 1) {
    const previous = items[items.length - 1]?.sortKey;

    items.push({
      id,
      name: `Item ${id}`,
      sortKey: trt.string.generateSortOrderKey({ previous }),
    });
  }

  items.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  console.log(items.length, items[0].sortKey.length); // 10 64
  console.log(items.map((item) => item.name)); // ['Item 1', 'Item 2', ..., 'Item 10']
  ```

  To insert an item between two existing items, pass the key before and after
  the insertion point. The option names are `previous` and `next`:

  ```ts
  function insertBetween(list: SortableItem[], item: Omit<SortableItem, 'sortKey'>, index: number) {
    const previous = list[index - 1]?.sortKey;
    const next = list[index]?.sortKey;

    list.splice(index, 0, {
      ...item,
      sortKey: trt.string.generateSortOrderKey({ previous, next }),
    });
  }

  insertBetween(items, { id: 11, name: 'Inserted item' }, 5);
  items.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  console.log(items[5].name, items[5].sortKey.length); // 'Inserted item' 64
  ```

  To swap adjacent items, remove the item from its old position and generate
  a new key at its new position:

  ```ts
  function moveItem(list: SortableItem[], from: number, to: number) {
    const [item] = list.splice(from, 1);
    const previous = list[to - 1]?.sortKey;
    const next = list[to]?.sortKey;

    item.sortKey = trt.string.generateSortOrderKey({ previous, next });
    list.splice(to, 0, item);
  }

  moveItem(items, 0, 1); // swap the first two items
  items.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  console.log(items[0].name, items[1].name); // 'Item 2' 'Item 1'
  ```

  If the same gap is continuously subdivided, midpoint allocation supports at
  most `ceil(log2(62^64 - 1)) = 382` successful insertions in the worst case.
  The exact limit depends on the distance between the two current keys. After
  the gap is exhausted, the function throws `No available rank between
previous and next`; re-index the list to create new gaps before retrying.

  ```ts
  let successfulInsertions = 0;

  for (let attempt = 1; attempt <= 382; attempt += 1) {
    try {
      insertBetween(items, { id: 100 + attempt, name: `Inserted ${attempt}` }, 1);
      successfulInsertions += 1;
    } catch (error) {
      console.log((error as Error).message); // 'No available rank between previous and next'
      break;
    }
  }

  console.log(successfulInsertions <= 382); // true
  ```

  This is the limit for repeatedly subdividing one gap, not the total number
  of records. Distributing inserts across different gaps supports many more
  records.

  ```ts
  try {
    trt.string.generateSortOrderKey({ previous: 'U'.padEnd(64, '0'), next: 'U'.padEnd(64, '0') });
  } catch (error) {
    console.log((error as Error).message); // 'Previous rank must be smaller than next rank'
  }
  ```

- `removeTones`: normalize text by removing accents and unsupported characters.

  ```ts
  console.log(trt.string.removeTones('Đặng Văn Lâm')); // 'Dang Van Lam'
  console.log(trt.string.removeTones('Crème brûlée')); // 'creme brulee'
  console.log(trt.string.removeTones('中文 Café 😀')); // 'cafe'
  console.log(trt.string.removeTones('中文 Café 😀', { removeNonLatinAscii: false })); // '中文 cafe'
  console.log(trt.string.removeTones('Đắk Lắk', { separator: '_' })); // 'dak_lak'
  console.log(trt.string.removeTones('Crème brûlée', { separator: '|' })); // 'creme|brulee'
  console.log(trt.string.removeTones('Straße')); // 'strasse'
  console.log(trt.string.removeTones('Ærøskøbing')); // 'aeroskobing'
  console.log(trt.string.removeTones('Łódź')); // 'lodz'
  ```
