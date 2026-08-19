import { BrowserCamera } from '@trt-web/core';

export const createCameraPage = (): HTMLElement => {
  const page = document.createElement('main');
  page.className = 'content';
  page.innerHTML = /*html*/ `
    <section class="hero">
      <p class="eyebrow">browser/media/camera</p>
      <h1>BrowserCamera</h1>
      <p>Preview, configure and record a camera stream.</p>
    </section>
    <section class="grid">
      <article class="card">
        <h2>Camera preview</h2>
        <video id="camera-preview" class="media-preview" autoplay muted playsinline></video>
        <div class="demo-actions">
          <button id="camera-start" type="button">Turn on camera</button>
          <button id="camera-stop" type="button">Turn off camera</button>
          <button id="camera-devices" type="button">List cameras</button>
          <button id="camera-facing-modes" type="button">Check facing modes</button>
        </div>
      </article>
      <article class="card">
        <h2>Constraints</h2>
        <label>Facing mode
          <select id="camera-facing">
            <option value="back">back camera</option>
            <option value="front">front camera</option>
            <option value="left">left camera</option>
            <option value="right">right camera</option>
          </select>
        </label>
        <label>Width <input id="camera-width" type="number" min="320" placeholder="ideal width" /></label>
        <label>Height <input id="camera-height" type="number" min="240" placeholder="ideal height" /></label>
        <p id="camera-result" class="demo-result">No action run yet.</p>
      </article>
      <article class="card">
        <h2>Recording</h2>
        <label>MIME type
          <select id="camera-mime">
            <option value="video/webm">video/webm</option>
            <option value="video/webm;codecs=vp9,opus">video/webm;codecs=vp9,opus</option>
          </select>
        </label>
        <div class="demo-actions">
          <button id="camera-record-start" type="button">Start recording</button>
          <button id="camera-record-stop" type="button">Stop recording</button>
        </div>
        <div id="camera-download"></div>
      </article>
    </section>
  `;

  const preview = page.querySelector<HTMLVideoElement>('#camera-preview')!;
  const result = page.querySelector<HTMLElement>('#camera-result')!;
  const download = page.querySelector<HTMLElement>('#camera-download')!;
  let recordingUrl: string | null = null;

  const readConstraints = () => {
    const width = Number(page.querySelector<HTMLInputElement>('#camera-width')!.value);
    const height = Number(page.querySelector<HTMLInputElement>('#camera-height')!.value);
    const facingMode = page.querySelector<HTMLSelectElement>('#camera-facing')!.value as
      | 'front'
      | 'back'
      | 'left'
      | 'right';

    return {
      facingMode,
      video: {
        ...(width > 0 ? { width: { ideal: width } } : {}),
        ...(height > 0 ? { height: { ideal: height } } : {}),
      },
    };
  };

  page.querySelector('#camera-start')?.addEventListener('click', async () => {
    result.textContent = 'Requesting camera permission...';
    const response = await BrowserCamera.turnOn(readConstraints());
    if (!response.success || !response.data) {
      result.textContent = `Camera unavailable (${response.permission}).`;
      return;
    }

    preview.srcObject = response.data;
    result.textContent = `Camera started (${response.permission}).`;
  });

  page.querySelector('#camera-stop')?.addEventListener('click', () => {
    const stopped = BrowserCamera.turnOff();
    preview.srcObject = null;
    result.textContent = stopped ? 'Camera stopped.' : 'No active camera stream.';
  });

  page.querySelector('#camera-devices')?.addEventListener('click', async () => {
    const devices = await BrowserCamera.listDevices();
    result.textContent = devices.length
      ? JSON.stringify(
          devices.map((device) => ({
            deviceId: device.deviceId,
            groupId: device.groupId,
            kind: device.kind,
            label: device.label || 'Unnamed camera',
          })),
          null,
          2,
        )
      : 'No camera devices found.';
  });

  page.querySelector('#camera-facing-modes')?.addEventListener('click', async () => {
    result.textContent = 'Checking supported camera facing modes...';
    const modes = await BrowserCamera.facingModes();
    result.textContent = modes.length
      ? `Supported facing modes: ${modes.join(', ')}.`
      : 'No supported front or back camera mode found.';
  });

  page.querySelector('#camera-record-start')?.addEventListener('click', async () => {
    const mimeType = page.querySelector<HTMLSelectElement>('#camera-mime')!.value;
    const recorder = await BrowserCamera.startRecording({ mimeType });
    result.textContent = recorder
      ? `Recording: ${recorder.mimeType}`
      : 'Could not start recording.';
  });

  page.querySelector('#camera-record-stop')?.addEventListener('click', async () => {
    const recording = await BrowserCamera.stopRecording();
    if (!recording || !recording.blob.size) {
      result.textContent = 'No recording data available.';
      return;
    }

    if (recordingUrl) {
      URL.revokeObjectURL(recordingUrl);
    }
    recordingUrl = URL.createObjectURL(recording.blob);
    download.innerHTML = /*html*/ `<a href="${recordingUrl}" download="camera-recording.webm">Download recording</a>`;
    result.textContent = `Recording ready (${recording.blob.size} bytes).`;
  });

  return page;
};
