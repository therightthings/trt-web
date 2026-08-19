import { BrowserAudioContext } from '@trt-web/core';

export const createAudioContextPage = (): HTMLElement => {
  const audioContext = BrowserAudioContext.getInstance();
  const page = document.createElement('main');
  page.className = 'content';
  page.innerHTML = /*html*/ `
    <section class="hero">
      <p class="eyebrow">browser/audio-context</p>
      <p>Create an audio context, play tones and inspect analyser data.</p>
    </section>
    <section class="grid">
      <article class="card">
        <h2>Audio context</h2>
        <div class="demo-actions">
          <button id="audio-create" type="button">Create context</button>
          <button id="audio-context-state" type="button">Read context</button>
          <button id="audio-suspend" type="button">Suspend</button>
          <button id="audio-resume" type="button">Resume</button>
          <button id="audio-close" type="button">Close</button>
        </div>
      </article>
      <article class="card">
        <h2>Analyser</h2>
        <label>FFT size <input id="audio-fft" type="number" value="2048" min="32" max="32768" step="2" /></label>
        <div class="demo-actions">
          <button id="audio-analyser" type="button">Create analyser</button>
          <button id="audio-frequency-data" type="button">Frequency data</button>
          <button id="audio-time-data" type="button">Time-domain data</button>
        </div>
        <p id="audio-result" class="demo-result">No action run yet.</p>
      </article>
      <article class="card">
        <h2>Audio waveform</h2>
        <label>Audio file <input id="audio-file" type="file" accept="audio/*" /></label>
        <canvas id="audio-waveform" width="800" height="220"></canvas>
        <div class="demo-actions">
          <button id="audio-file-stop" type="button">Stop audio</button>
        </div>
      </article>
    </section>
  `;

  const result = page.querySelector<HTMLElement>('#audio-result')!;
  const number = (selector: string) =>
    Number(page.querySelector<HTMLInputElement>(selector)!.value);
  const show = (value: unknown) => {
    result.textContent = typeof value === 'string' ? value : JSON.stringify(value);
  };
  const canvas = page.querySelector<HTMLCanvasElement>('#audio-waveform')!;
  const canvasContext = canvas.getContext('2d');
  let animationFrame: number | undefined;
  let waveform: Float32Array | undefined;
  let waveformDuration = 0;
  let waveformStartedAt = 0;
  let audioSession: ReturnType<typeof audioContext.createAudioSession>;
  const drawWaveform = () => {
    if (!canvasContext || !waveform) {
      return;
    }

    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    canvasContext.beginPath();
    const currentWaveform = waveform;
    currentWaveform.forEach((value, index) => {
      const x = (index / (currentWaveform.length - 1)) * canvas.width;
      const amplitude = value * (canvas.height / 2);
      const y = canvas.height / 2 - amplitude;
      if (index === 0) {
        canvasContext.moveTo(x, y);
      } else {
        canvasContext.lineTo(x, y);
      }
    });
    canvasContext.stroke();

    const elapsed = (performance.now() - waveformStartedAt) / 1000;
    const playheadX = Math.min(elapsed / waveformDuration, 1) * canvas.width;
    canvasContext.beginPath();
    canvasContext.moveTo(playheadX, 0);
    canvasContext.lineTo(playheadX, canvas.height);
    canvasContext.stroke();

    if (elapsed >= waveformDuration) {
      animationFrame = undefined;
      return;
    }

    animationFrame = requestAnimationFrame(drawWaveform);
  };
  const stopWaveform = () => {
    if (animationFrame !== undefined) {
      cancelAnimationFrame(animationFrame);
      animationFrame = undefined;
    }
    audioSession?.stop();
    waveformStartedAt = 0;
  };

  page.querySelector('#audio-create')?.addEventListener('click', async () => {
    show((await audioContext.ready()) ? 'AudioContext created.' : 'Unsupported.');
  });
  page
    .querySelector('#audio-context-state')
    ?.addEventListener('click', () => show(audioContext.getState() ?? 'No context.'));
  page
    .querySelector('#audio-suspend')
    ?.addEventListener('click', async () => show(await audioContext.suspend()));
  page
    .querySelector('#audio-resume')
    ?.addEventListener('click', async () => show(await audioContext.resume()));
  page.querySelector('#audio-close')?.addEventListener('click', async () => {
    await audioContext.close();
    show('AudioContext closed.');
  });
  page.querySelector('#audio-analyser')?.addEventListener('click', () => {
    show(
      audioSession?.createAnalyser({ fftSize: number('#audio-fft') })
        ? 'Analyser created.'
        : 'Create an audio session first.',
    );
  });
  page
    .querySelector('#audio-frequency-data')
    ?.addEventListener('click', () =>
      show(audioSession?.getFrequencyData()?.slice(0, 16) ?? 'Create an audio session first.'),
    );
  page
    .querySelector('#audio-time-data')
    ?.addEventListener('click', () =>
      show(audioSession?.getTimeDomainData()?.slice(0, 16) ?? 'Create an audio session first.'),
    );
  page.querySelector<HTMLInputElement>('#audio-file')?.addEventListener('change', async (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) {
      return;
    }

    stopWaveform();
    const audioBuffer = await audioContext.decodeAudioData(await file.arrayBuffer());
    if (!audioBuffer) {
      show('Could not decode audio file.');
      return;
    }

    waveformDuration = audioBuffer.duration;
    await audioContext.ready();
    audioSession = audioContext.createAudioSession(audioBuffer);
    audioSession?.createAnalyser({ fftSize: 2048 });
    waveform = audioSession?.getWaveformData({ samples: 1000 });
    audioSession?.play();
    const started = Boolean(audioSession);
    show(started ? `Playing ${file.name}` : 'Could not play audio file.');
    if (started && waveform && waveformDuration > 0) {
      waveformStartedAt = performance.now();
      drawWaveform();
    }
  });
  page.querySelector('#audio-file-stop')?.addEventListener('click', () => {
    stopWaveform();
    show('Audio stopped.');
  });

  return page;
};
