import { BrowserAudioContext, Canvas } from '@trt-web/core';

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
          <button id="audio-support" type="button">Check support</button>
          <button id="audio-create" type="button">Create context</button>
          <button id="audio-context-state" type="button">Read context</button>
          <button id="audio-suspend" type="button">Suspend</button>
          <button id="audio-resume" type="button">Resume</button>
          <button id="audio-tone" type="button">Play tone</button>
          <button id="audio-tone-session-create" type="button">Create tone session</button>
          <button id="audio-tone-session-play" type="button">Play tone session</button>
          <button id="audio-tone-session-stop" type="button">Stop tone session</button>
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
        <h2>Tone session analyser</h2>
        <p>Read realtime frequency data from an oscillator tone session.</p>
        <pre id="audio-tone-session-result" class="demo-result">No tone session created yet.</pre>
      </article>
      <article class="card">
        <h2>Audio waveform</h2>
        <label>Audio file <input id="audio-file" type="file" accept="audio/*" /></label>
        <canvas id="audio-waveform" class="audio-waveform" height="220"></canvas>
        <p id="audio-time" class="audio-time">0:00 / 0:00</p>
        <div class="demo-actions">
          <button id="audio-file-pause" type="button">Pause audio</button>
          <button id="audio-file-resume" type="button">Resume audio</button>
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
  const canvasSession = Canvas.createSession(canvas);
  const timeDisplay = page.querySelector<HTMLElement>('#audio-time')!;
  let animationFrame: number | undefined;
  let waveform: Float32Array | undefined;
  let waveformDuration = 0;
  let waveformStartedAt = 0;
  let waveformElapsed = 0;
  let audioSession: ReturnType<typeof audioContext.createAudioSession>;
  let toneSession: ReturnType<typeof audioContext.createToneSession>;
  let toneAnimationFrame: number | undefined;
  const toneResult = page.querySelector<HTMLElement>('#audio-tone-session-result')!;
  const formatTime = (seconds: number): string => {
    const totalSeconds = Math.max(0, Math.floor(seconds));
    const minutes = Math.floor(totalSeconds / 60);
    const remainder = String(totalSeconds % 60).padStart(2, '0');
    return `${minutes}:${remainder}`;
  };
  const updateTimeDisplay = (currentTime: number): void => {
    timeDisplay.textContent = `${formatTime(currentTime)} / ${formatTime(waveformDuration)}`;
  };
  const drawWaveform = () => {
    if (!waveform) {
      return;
    }

    const width = Math.max(1, Math.floor(canvas.clientWidth));
    const height = Math.max(1, Math.floor(canvas.clientHeight));
    canvasSession.resize({ devicePixelRatio: 1, height, width });

    const rootStyles = getComputedStyle(document.documentElement);
    const accentColor = rootStyles.getPropertyValue('--app-accent-default').trim();
    const playheadColor = rootStyles.getPropertyValue('--app-text-success').trim();

    canvasSession.clear();
    const path = new Path2D();
    const currentWaveform = waveform;
    currentWaveform.forEach((value, index) => {
      const x = (index / (currentWaveform.length - 1)) * width;
      const amplitude = value * (height / 2);
      const y = height / 2 - amplitude;
      if (index === 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }
    });
    canvasSession.drawPath(path, { lineWidth: 2, strokeStyle: accentColor });

    const elapsed = Math.min(
      waveformDuration,
      waveformElapsed + (performance.now() - waveformStartedAt) / 1000,
    );
    updateTimeDisplay(elapsed);
    const playheadX = Math.min(elapsed / waveformDuration, 1) * width;
    canvasSession.drawLine({
      end: [playheadX, height],
      lineWidth: 2,
      start: [playheadX, 0],
      strokeStyle: playheadColor,
    });

    if (elapsed >= waveformDuration) {
      waveformElapsed = waveformDuration;
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
    waveformElapsed = 0;
    waveformStartedAt = 0;
    updateTimeDisplay(0);
  };
  const stopToneVisualiser = (): void => {
    if (toneAnimationFrame !== undefined) {
      cancelAnimationFrame(toneAnimationFrame);
      toneAnimationFrame = undefined;
    }
  };
  const renderToneData = (): void => {
    const data = toneSession?.getFrequencyData();
    if (!data) {
      toneResult.textContent = 'Create a tone session and analyser first.';
      toneAnimationFrame = undefined;
      return;
    }

    toneResult.textContent = JSON.stringify(
      {
        state: toneSession?.state,
        length: data.length,
        values: [...data.slice(0, 16)],
      },
      null,
      2,
    );
    if (toneSession?.state !== 'playing') {
      toneAnimationFrame = undefined;
      return;
    }
    toneAnimationFrame = requestAnimationFrame(renderToneData);
  };

  page.querySelector('#audio-create')?.addEventListener('click', async () => {
    show((await audioContext.ready()) ? 'AudioContext created.' : 'Unsupported.');
  });
  page.querySelector('#audio-support')?.addEventListener('click', () => {
    try {
      show({ supported: BrowserAudioContext.isSupported(), state: audioContext.getState() });
    } catch (error) {
      show(error instanceof Error ? error.message : String(error));
    }
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
  page.querySelector('#audio-tone')?.addEventListener('click', async () => {
    show(
      await audioContext.playTone({
        tones: [
          { frequency: 523, type: 'sine', gain: 0.08, durationMs: 90, gapMs: 40 },
          { frequency: 659, type: 'sine', gain: 0.08, durationMs: 120 },
        ],
      }),
    );
  });
  page.querySelector('#audio-tone-session-create')?.addEventListener('click', async () => {
    if (!(await audioContext.ready())) {
      toneResult.textContent = 'AudioContext is not supported.';
      return;
    }

    stopToneVisualiser();
    toneSession?.stop();
    toneSession = audioContext.createToneSession({
      tones: [
        { frequency: 523, type: 'sine', gain: 0.08, durationMs: 300, gapMs: 40 },
        { frequency: 659, type: 'sine', gain: 0.08, durationMs: 300 },
      ],
    });
    toneSession?.createAnalyser({ fftSize: 256, smoothingTimeConstant: 0.8 });
    toneResult.textContent = toneSession
      ? JSON.stringify({ state: toneSession.state, analyser: 'created' }, null, 2)
      : 'Could not create tone session.';
  });
  page.querySelector('#audio-tone-session-play')?.addEventListener('click', async () => {
    if (!toneSession) {
      toneResult.textContent = 'Create a tone session first.';
      return;
    }

    const started = await toneSession.play();
    if (started) {
      stopToneVisualiser();
      renderToneData();
    }
    toneResult.textContent = started ? 'Tone session is playing.' : 'Could not play tone session.';
  });
  page.querySelector('#audio-tone-session-stop')?.addEventListener('click', () => {
    stopToneVisualiser();
    toneSession?.stop();
    toneResult.textContent = toneSession
      ? JSON.stringify({ state: toneSession.state }, null, 2)
      : 'No tone session to stop.';
  });
  page.querySelector('#audio-close')?.addEventListener('click', async () => {
    stopToneVisualiser();
    await audioContext.close();
    toneSession = undefined;
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
    waveformElapsed = 0;
    updateTimeDisplay(0);
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
  page.querySelector('#audio-file-pause')?.addEventListener('click', () => {
    if (animationFrame !== undefined) {
      cancelAnimationFrame(animationFrame);
      animationFrame = undefined;
    }
    if (waveformStartedAt) {
      waveformElapsed = Math.min(
        waveformDuration,
        waveformElapsed + (performance.now() - waveformStartedAt) / 1000,
      );
    }
    waveformStartedAt = 0;
    updateTimeDisplay(waveformElapsed);
    show(audioSession?.pause() ? 'Audio paused.' : 'No audio is playing.');
  });
  page.querySelector('#audio-file-resume')?.addEventListener('click', () => {
    const resumed = audioSession?.resume() ?? false;
    if (resumed) {
      waveformStartedAt = performance.now();
      drawWaveform();
    }
    show(resumed ? 'Audio resumed.' : 'No audio session to resume.');
  });

  return page;
};
