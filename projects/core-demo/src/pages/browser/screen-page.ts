import { BrowserScreen } from '@trt-web/core';

export const createScreenPage = (): HTMLElement => {
  const page = document.createElement('main');
  page.className = 'content';
  page.innerHTML = /*html*/ `
    <section class="hero">
      <p class="eyebrow">browser/media/screen</p>
      <h1>BrowserScreen</h1>
      <p>Capture a selected screen or window, take screenshots and record the stream.</p>
    </section>
    <section class="grid">
      <article class="card">
        <h2>Screen capture</h2>
        <video id="screen-preview" class="media-preview" autoplay muted playsinline></video>
        <label>Display surface
          <select id="screen-surface">
            <option value="">Browser default</option>
            <option value="monitor">monitor</option>
            <option value="window">window</option>
            <option value="browser">browser</option>
            <option value="application">application</option>
          </select>
        </label>
        <label>Capture audio
          <select id="screen-audio">
            <option value="false">false</option>
            <option value="true">true</option>
          </select>
        </label>
        <div class="demo-actions">
          <button id="screen-support" type="button">Check support</button>
          <button id="screen-start" type="button">Start capture</button>
          <button id="screen-stop" type="button">Stop capture</button>
          <button id="screen-current" type="button">Read current stream</button>
        </div>
      </article>
      <article class="card">
        <h2>Screenshot</h2>
        <label>Image type
          <select id="screen-image-type">
            <option value="image/png">image/png</option>
            <option value="image/jpeg">image/jpeg</option>
            <option value="image/webp">image/webp</option>
          </select>
        </label>
        <label>Quality <input id="screen-quality" type="number" min="0" max="1" step="0.1" value="0.9" /></label>
        <button id="screen-screenshot" type="button">Take screenshot</button>
        <div id="screen-screenshot-result"></div>
      </article>
      <article class="card">
        <h2>Recording and state</h2>
        <label>MIME type
          <select id="screen-mime">
            <option value="video/webm">video/webm</option>
            <option value="video/webm;codecs=vp9,opus">video/webm;codecs=vp9,opus</option>
          </select>
        </label>
        <div class="demo-actions">
          <button id="screen-record-start" type="button">Start recording</button>
          <button id="screen-record-stop" type="button">Stop recording</button>
          <button id="screen-record-pause" type="button">Pause</button>
          <button id="screen-record-resume" type="button">Resume</button>
          <button id="screen-record-data" type="button">Request data</button>
        </div>
        <p id="screen-result" class="demo-result">No action run yet.</p>
        <div id="screen-download"></div>
      </article>
    </section>
  `;

  const preview = page.querySelector<HTMLVideoElement>('#screen-preview')!;
  const result = page.querySelector<HTMLElement>('#screen-result')!;
  const screenshotResult = page.querySelector<HTMLElement>('#screen-screenshot-result')!;
  const download = page.querySelector<HTMLElement>('#screen-download')!;
  let screenshotUrl: string | null = null;
  let recordingUrl: string | null = null;

  const captureConstraints = () => {
    const surface = page.querySelector<HTMLSelectElement>('#screen-surface')!.value;
    const audio = page.querySelector<HTMLSelectElement>('#screen-audio')!.value === 'true';

    return {
      video: surface ? { displaySurface: surface as DisplayCaptureSurfaceType } : true,
      audio,
    };
  };

  page.querySelector('#screen-start')?.addEventListener('click', async () => {
    result.textContent = 'Waiting for screen selection...';
    const stream = await BrowserScreen.startCapture(captureConstraints());
    if (!stream) {
      result.textContent = 'Screen capture was not started.';
      return;
    }

    preview.srcObject = stream;
    result.textContent = `Capture active: ${BrowserScreen.isStreamActive(stream)}.`;
  });

  page.querySelector('#screen-stop')?.addEventListener('click', () => {
    const stopped = BrowserScreen.stopCapture();
    preview.srcObject = null;
    result.textContent = stopped ? 'Screen capture stopped.' : 'No active screen capture.';
  });

  page.querySelector('#screen-support')?.addEventListener('click', () => {
    result.textContent = `Supported: ${BrowserScreen.isSupported()}.`;
  });

  page.querySelector('#screen-current')?.addEventListener('click', () => {
    const stream = BrowserScreen.getCurrentStream();
    result.textContent = stream
      ? `Current stream active: ${BrowserScreen.isStreamActive(stream)}.`
      : 'No current stream.';
  });

  page.querySelector('#screen-screenshot')?.addEventListener('click', async () => {
    result.textContent = 'Waiting for screen selection...';
    const type = page.querySelector<HTMLSelectElement>('#screen-image-type')!.value as
      | 'image/png'
      | 'image/jpeg'
      | 'image/webp';
    const quality = Number(page.querySelector<HTMLInputElement>('#screen-quality')!.value);
    const blob = await BrowserScreen.takeScreenshot({
      capture: captureConstraints(),
      image: { type, quality },
    });

    if (!blob) {
      result.textContent = 'Screenshot failed.';
      return;
    }

    if (screenshotUrl) {
      URL.revokeObjectURL(screenshotUrl);
    }
    screenshotUrl = URL.createObjectURL(blob);
    screenshotResult.innerHTML = /*html*/ `<a href="${screenshotUrl}" download="screen-screenshot.${type.split('/')[1]}">Download screenshot</a>`;
    result.textContent = `Screenshot ready (${blob.size} bytes).`;
  });

  page.querySelector('#screen-record-start')?.addEventListener('click', async () => {
    const mimeType = page.querySelector<HTMLSelectElement>('#screen-mime')!.value;
    const recorder = await BrowserScreen.startRecording({ mimeType });
    result.textContent = recorder
      ? `Recording: ${recorder.mimeType}`
      : 'Start capture before recording.';
  });

  page.querySelector('#screen-record-stop')?.addEventListener('click', () => {
    const recording = BrowserScreen.stopRecording();
    if (!recording || !recording.blob.size) {
      result.textContent = 'No recording data available.';
      return;
    }

    if (recordingUrl) {
      URL.revokeObjectURL(recordingUrl);
    }
    recordingUrl = URL.createObjectURL(recording.blob);
    download.innerHTML = /*html*/ `<a href="${recordingUrl}" download="screen-recording.webm">Download recording</a>`;
    result.textContent = `Recording ready (${recording.blob.size} bytes).`;
  });

  page.querySelector('#screen-record-pause')?.addEventListener('click', () => {
    result.textContent = `Pause: ${BrowserScreen.pauseRecording()}.`;
  });
  page.querySelector('#screen-record-resume')?.addEventListener('click', () => {
    result.textContent = `Resume: ${BrowserScreen.resumeRecording()}.`;
  });
  page.querySelector('#screen-record-data')?.addEventListener('click', () => {
    result.textContent = `Request data: ${BrowserScreen.requestRecordingData()}.`;
  });

  return page;
};
