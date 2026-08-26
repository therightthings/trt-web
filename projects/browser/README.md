# @trt-web/browser

Framework-free wrappers for browser APIs.

### Direct exports

+- `Canvas`

- `isSupported`: check whether the HTML Canvas API is available.
- `createSession`: create an isolated `CanvasSession` for a canvas element.

- `CanvasSession`
  - `getContext`: get the session's 2D rendering context.
  - `getSize`: read the canvas backing-store size.
  - `resize`: resize the canvas, optionally fitting its element or parent and applying device-pixel-ratio scaling.
  - `clear`: clear the canvas and optionally fill it with a color.
  - `drawLine`: draw a line with stroke options.
  - `drawRectangle`: draw a filled and/or stroked rectangle, optionally with rounded corners.
  - `drawCircle`: draw a filled and/or stroked circle.
  - `drawText`: draw text with font and alignment options.
  - `drawImage`: draw an image source at a position and optional size.
  - `getImageData`: read pixel data from a rectangular area.
  - `putImageData`: write pixel data to the canvas.
  - `createGradient`: create a linear or radial gradient.
  - `drawPath`: draw or fill a `Path2D` path.
  - `drawPolyline`: draw an ordered list of points as an open or closed stroked path.
  - `rotate`: rotate the current drawing transform.
  - `scale`: scale the current drawing transform.
  - `translate`: translate the current drawing transform.
  - `flip`: flip the current drawing transform horizontally or vertically.
  - `resetTransform`: reset the current drawing transform.
  - `toBlob`: export the canvas as a `Blob`.
  - `toDataUrl`: export the canvas as a data URL.

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

- `BrowserSubscription`
  - `unsubscribe`: remove the associated browser event listeners.

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

- `BrowserNotification`
  - `isSupported`: check whether the Notifications API is available in a secure context.
  - `getPermission`: read the current notification permission.
  - `requestPermission`: request permission from the user.
  - `getMaxActions`: read the maximum number of notification actions supported by the browser.
  - `show`: create a notification session when permission is granted.

- `BrowserNotificationSession`
  - `getInfo`: return a structured snapshot of the notification instance properties.
  - `addEventListener`: listen for notification events.
  - `removeEventListener`: remove a notification event listener.
  - `close`: close the notification.

  ```ts
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
  ```

  Download progress can reuse the same `tag` so each notification belongs to
  the same progress group. Set `renotify: true` when Chrome should alert again
  after replacing the previous progress notification:

  ```ts
  const progressNotification = BrowserNotification.show('Downloading file', {
    body: '45% completed',
    tag: 'download-progress',
    renotify: true,
    icon: '/icons/download.png',
  });

  console.log(progressNotification?.getInfo().behavior.tag); // 'download-progress'
  console.log(progressNotification?.getInfo().behavior.renotify); // true
  ```

  For an incoming call, use `requireInteraction: true` to keep the notification
  visible until the user clicks or dismisses it:

  ```ts
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

  `show` returns a `BrowserNotificationSession`, which exposes the standard
  notification properties, events, and `close()` method. Notification permission requests
  should be triggered by a user action such as a button click. For persistent
  notifications that work outside the current page, use a service worker and
  `ServiceWorkerRegistration.showNotification()`.

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
  - `supportedPermissions`: list permissions supported by the utility.
  - `getState`: check the state of a browser permission.
  - `request`: request a browser permission.

  ```ts
  const current = await BrowserPermission.getState('geolocation');
  console.log(BrowserPermission.supportedPermissions()); // ['geolocation', 'notifications', ...]
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
  - `createToneSession`: create an isolated oscillator tone session.
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

- `BrowserAudioTonesSession`
  - `state`: read whether the tone session is idle, playing, or stopped.
  - `play`: start the tone sequence and stop the previous sequence if needed.
  - `stop`: stop the current oscillators and clean up audio nodes.
  - `createAnalyser`: create an analyser for the tone output.
  - `getAnalyser`: get the configured analyser node.
  - `getFrequencyData`: read frequency-domain data from the tone output.
  - `getTimeDomainData`: read time-domain data from the tone output.

  ```ts
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

- `BrowserPerformance`
  - `isSupported`: check whether the Performance API is available.
  - `createSession`: create a session exposing the native Performance properties and methods.
  - `now`, `mark`, `measure`, `measureAsync`: measure browser-side work.
  - `getEntries`, `getNavigationTiming`, `getResourceTiming`: read performance entries. `getEntries` accepts `{ name?, type? }`.
  - `clearMarks`, `clearMeasures`: remove user timing entries.

- `BrowserPerformanceSession`
  - exposes `eventCounts`, `interactionCount`, `memory`, and `timeOrigin`.
  - exposes `getNavigationTiming` and `getResourceTiming` using Navigation Timing Level 2 entries.
  - `analyzePage`: return a normalized snapshot of current page navigation, resources, memory, and interaction data.
  - exposes the native methods `clearMarks`, `clearMeasures`, `clearResourceTimings`, `getEntries`, `getEntriesByName`, `getEntriesByType`, `mark`, `measure`, `measureUserAgentSpecificMemory`, `now`, `setResourceTimingBufferSize`, and `toJSON`.

  ```ts
  const result = await BrowserPerformance.measureAsync('load-users', async () => {
    return await loadUsers();
  });

  console.log(result?.value, result?.measure.duration);
  // Output: [{ id: 1, name: 'Alice' }] 42.5
  ```

  ```ts
  const performance = BrowserPerformance.createSession();

  console.log(performance?.timeOrigin);
  console.log(performance?.getEntriesByType('resource'));
  console.log(await performance?.measureUserAgentSpecificMemory());
  ```

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
  - `getDevice`: get the currently connected Bluetooth device.
  - `getServer`: get the currently connected GATT server.
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
  console.log(BrowserBluetooth.getDevice(), BrowserBluetooth.getServer());
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
  - `unsubscribe`: unsubscribe all active network subscriptions.

  ```ts
  const subscription = BrowserNetwork.subscribe((state) => {
    console.log(state.status, state.effectiveType);
  });

  subscription.unsubscribe();
  BrowserNetwork.unsubscribe(); // remove any remaining network subscriptions
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
  - `addTrack`: add a media track to the peer connection.
  - `removeTrack`: remove a sender from the peer connection.
  - `configureVideoSender`: configure video bitrate and frame rate.
  - `createDataChannel`: create a data channel.
  - `createOffer`: create an SDP offer.
  - `createAnswer`: create an SDP answer.
  - `setLocalDescription`: set the local SDP description.
  - `setRemoteDescription`: set the remote SDP description.
  - `addIceCandidate`: add a remote ICE candidate.
  - `getStats`: read connection statistics.
  - `restartIce`: request an ICE restart.
  - `createConnectionFromOffer`: create a connection and apply a remote offer.
  - `close`: close the peer connection and remove listeners.

  This utility wraps the browser `RTCPeerConnection` API only. It does not provide
  signaling, ICE candidate exchange, STUN/TURN infrastructure or reconnection logic.
  A real peer-to-peer application must provide those pieces separately.

  ```ts
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
  BrowserTabActivity.unsubscribe(); // remove any remaining tab subscriptions
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
  - `reload`: reload the current tab.
  - `goBack`: navigate backward in the current tab.
  - `goForward`: navigate forward in the current tab.
  - `pushState`: add a history entry without reloading the page.
  - `replaceState`: replace the current history entry without reloading the page.
  - `historyState`: read the current history state.
  - `alert`: show a browser alert dialog.
  - `confirm`: show a browser confirmation dialog.
  - `prompt`: show a browser prompt dialog.
  - `print`: open the browser print dialog.
  - `preload`: preload a URL resource.
  - `getKeyboardEventInfo`: extract keyboard event information.
  - `getPointerEventInfo`: extract pointer event information.

  ```ts
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
