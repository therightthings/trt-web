import { BrowserAudioContext } from '@trt-web/core';

export const createAudioContextPage = (): HTMLElement => {
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
        <label>Frequency (Hz) <input id="audio-frequency" type="number" value="440" min="20" max="20000" /></label>
        <label>Gain <input id="audio-gain" type="number" value="0.1" min="0" max="1" step="0.05" /></label>
        <label>Duration (ms) <input id="audio-duration" type="number" value="500" min="0" /></label>
        <div class="demo-actions">
          <button id="audio-create" type="button">Create context</button>
          <button id="audio-context-state" type="button">Read context</button>
          <button id="audio-create-gain" type="button">Create gain</button>
          <button id="audio-oscillator" type="button">Create oscillator</button>
          <button id="audio-play" type="button">Play tone</button>
          <button id="audio-stop" type="button">Stop tone</button>
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
    </section>
  `;

  const result = page.querySelector<HTMLElement>('#audio-result')!;
  const number = (selector: string) =>
    Number(page.querySelector<HTMLInputElement>(selector)!.value);
  const show = (value: unknown) => {
    result.textContent = typeof value === 'string' ? value : JSON.stringify(value);
  };

  page.querySelector('#audio-create')?.addEventListener('click', async () => {
    show((await BrowserAudioContext.createContext()) ? 'AudioContext created.' : 'Unsupported.');
  });
  page
    .querySelector('#audio-context-state')
    ?.addEventListener('click', () =>
      show(BrowserAudioContext.getContext()?.state ?? 'No context.'),
    );
  page
    .querySelector('#audio-create-gain')
    ?.addEventListener('click', () =>
      show(Boolean(BrowserAudioContext.createGain(number('#audio-gain') || 1))),
    );
  page
    .querySelector('#audio-oscillator')
    ?.addEventListener('click', () =>
      show(
        Boolean(BrowserAudioContext.createOscillator({ frequency: number('#audio-frequency') })),
      ),
    );
  page.querySelector('#audio-play')?.addEventListener('click', async () => {
    show(
      await BrowserAudioContext.playTone({
        frequency: number('#audio-frequency'),
        gain: number('#audio-gain'),
        durationMs: number('#audio-duration'),
      }),
    );
  });
  page.querySelector('#audio-stop')?.addEventListener('click', () => {
    BrowserAudioContext.stopTone();
    show('Tone stopped.');
  });
  page
    .querySelector('#audio-suspend')
    ?.addEventListener('click', async () => show(await BrowserAudioContext.suspend()));
  page
    .querySelector('#audio-resume')
    ?.addEventListener('click', async () => show(await BrowserAudioContext.resume()));
  page.querySelector('#audio-close')?.addEventListener('click', async () => {
    await BrowserAudioContext.close();
    show('AudioContext closed.');
  });
  page.querySelector('#audio-analyser')?.addEventListener('click', () => {
    show(
      BrowserAudioContext.createAnalyser({ fftSize: number('#audio-fft') })
        ? 'Analyser created.'
        : 'Create context first.',
    );
  });
  page
    .querySelector('#audio-frequency-data')
    ?.addEventListener('click', () =>
      show(BrowserAudioContext.getFrequencyData()?.slice(0, 16) ?? 'No analyser.'),
    );
  page
    .querySelector('#audio-time-data')
    ?.addEventListener('click', () =>
      show(BrowserAudioContext.getTimeDomainData()?.slice(0, 16) ?? 'No analyser.'),
    );

  return page;
};
