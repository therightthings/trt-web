import { BrowserMicrophone } from '@trt-web/core';

export const createMicrophonePage = (): HTMLElement => {
  const page = document.createElement('main');
  page.className = 'content';
  page.innerHTML = /*html*/ `
    <section class="hero">
      <p class="eyebrow">browser/media/microphone</p>
      <h1>BrowserMicrophone</h1>
      <p>Preview, configure and record microphone audio.</p>
    </section>
    <section class="grid">
      <article class="card">
        <h2>Microphone</h2>
        <audio id="microphone-preview" controls></audio>
        <div class="demo-actions">
          <button id="microphone-start" type="button">Turn on microphone</button>
          <button id="microphone-stop" type="button">Turn off microphone</button>
          <button id="microphone-devices" type="button">List microphones</button>
        </div>
      </article>
      <article class="card">
        <h2>Constraints</h2>
        <label>Echo cancellation
          <select id="microphone-echo">
            <option value="true">true</option>
            <option value="false">false</option>
          </select>
        </label>
        <label>Noise suppression
          <select id="microphone-noise">
            <option value="true">true</option>
            <option value="false">false</option>
          </select>
        </label>
        <label>Channel count
          <input id="microphone-channel" type="number" min="1" max="2" value="1" />
        </label>
        <p id="microphone-result" class="demo-result">No action run yet.</p>
      </article>
      <article class="card">
        <h2>Recording</h2>
        <label>MIME type
          <select id="microphone-mime">
            <option value="audio/webm">audio/webm</option>
            <option value="audio/webm;codecs=opus">audio/webm;codecs=opus</option>
          </select>
        </label>
        <div class="demo-actions">
          <button id="microphone-record-start" type="button">Start recording</button>
          <button id="microphone-record-stop" type="button">Stop recording</button>
        </div>
        <div id="microphone-download"></div>
      </article>
    </section>
  `;

  const preview = page.querySelector<HTMLAudioElement>('#microphone-preview')!;
  const result = page.querySelector<HTMLElement>('#microphone-result')!;
  const download = page.querySelector<HTMLElement>('#microphone-download')!;
  let recordingUrl: string | null = null;

  const readConstraints = () => {
    const echoCancellation = page.querySelector<HTMLSelectElement>('#microphone-echo')!.value;
    const noiseSuppression = page.querySelector<HTMLSelectElement>('#microphone-noise')!.value;
    const channelCount = Number(page.querySelector<HTMLInputElement>('#microphone-channel')!.value);

    return {
      audio: {
        echoCancellation: echoCancellation === 'true',
        noiseSuppression: noiseSuppression === 'true',
        ...(channelCount > 0 ? { channelCount: { ideal: channelCount } } : {}),
      },
      video: false,
    };
  };

  page.querySelector('#microphone-start')?.addEventListener('click', async () => {
    result.textContent = 'Requesting microphone permission...';
    const response = await BrowserMicrophone.turnOnMicrophone(readConstraints());
    if (!response.success || !response.data) {
      result.textContent = `Microphone unavailable (${response.permission}).`;
      return;
    }

    preview.srcObject = response.data;
    result.textContent = `Microphone started (${response.permission}).`;
  });

  page.querySelector('#microphone-stop')?.addEventListener('click', () => {
    const stopped = BrowserMicrophone.turnOffMicrophone();
    preview.srcObject = null;
    result.textContent = stopped ? 'Microphone stopped.' : 'No active microphone stream.';
  });

  page.querySelector('#microphone-devices')?.addEventListener('click', async () => {
    const devices = await BrowserMicrophone.listDevices();
    result.textContent = devices.length
      ? devices
          .map((device) => `${device.label || 'Unnamed microphone'} (${device.deviceId})`)
          .join('\n')
      : 'No microphone devices found.';
  });

  page.querySelector('#microphone-record-start')?.addEventListener('click', async () => {
    const mimeType = page.querySelector<HTMLSelectElement>('#microphone-mime')!.value;
    const recorder = await BrowserMicrophone.startRecording({ mimeType });
    result.textContent = recorder
      ? `Recording: ${recorder.mimeType}`
      : 'Could not start recording.';
  });

  page.querySelector('#microphone-record-stop')?.addEventListener('click', () => {
    const recording = BrowserMicrophone.stopRecording();
    if (!recording || !recording.blob.size) {
      result.textContent = 'No recording data available.';
      return;
    }

    if (recordingUrl) {
      URL.revokeObjectURL(recordingUrl);
    }
    recordingUrl = URL.createObjectURL(recording.blob);
    download.innerHTML = /*html*/ `<a href="${recordingUrl}" download="microphone-recording.webm">Download recording</a>`;
    result.textContent = `Recording ready (${recording.blob.size} bytes).`;
  });

  return page;
};
