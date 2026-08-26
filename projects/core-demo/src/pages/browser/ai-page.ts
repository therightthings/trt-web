import { BrowserAI } from '@trt-web/browser';

export const createAiPage = (): HTMLElement => {
  const page = document.createElement('main');
  page.className = 'content';
  page.innerHTML = /* html */ `
    <section class="hero">
      <p class="eyebrow">browser/ai</p>
      <h1>BrowserAI</h1>
      <p>Detect languages, summarize text and translate content with built-in browser AI.</p>
    </section>
    <section class="card">
      <div class="demo-actions">
        <button id="ai-support" type="button">Check support</button>
        <button id="ai-availability" type="button">Check availability</button>
      </div>
      <pre id="ai-support-result" class="demo-result">No support check run yet.</pre>
    </section>
    <section class="card">
      <label>Text to process<textarea id="ai-input" rows="5">Bonjour tout le monde. This is a longer text that can be summarized by the browser.</textarea></label>
      <label>Source language<input id="ai-source" value="en" /></label>
      <label>Target language<input id="ai-target" value="vi" /></label>
      <div class="demo-actions">
        <button id="ai-detect" type="button">Detect language</button>
        <button id="ai-summarize" type="button">Summarize</button>
        <button id="ai-translate" type="button">Translate</button>
      </div>
      <pre id="ai-result" class="demo-result">No AI operation run yet.</pre>
    </section>`;

  const input = page.querySelector<HTMLTextAreaElement>('#ai-input')!;
  const source = page.querySelector<HTMLInputElement>('#ai-source')!;
  const target = page.querySelector<HTMLInputElement>('#ai-target')!;
  const supportResult = page.querySelector<HTMLElement>('#ai-support-result')!;
  const result = page.querySelector<HTMLElement>('#ai-result')!;

  const showError = (error: unknown): void => {
    result.textContent = error instanceof Error ? error.message : String(error);
  };

  page.querySelector('#ai-support')?.addEventListener('click', () => {
    try {
      supportResult.textContent = JSON.stringify(
        { supported: BrowserAI.isSupported(), features: BrowserAI.supportedFeatures() },
        null,
        2,
      );
    } catch (error) {
      supportResult.textContent = error instanceof Error ? error.message : String(error);
    }
  });

  page.querySelector('#ai-availability')?.addEventListener('click', async () => {
    try {
      const [languageDetector, summarizer, translator] = await Promise.all([
        BrowserAI.detectAvailability(),
        BrowserAI.summarizeAvailability({
          type: 'key-points',
          format: 'plain-text',
          length: 'short',
        }),
        BrowserAI.translateAvailability({
          sourceLanguage: source.value,
          targetLanguage: target.value,
        }),
      ]);
      supportResult.textContent = JSON.stringify(
        { languageDetector, summarizer, translator },
        null,
        2,
      );
    } catch (error) {
      supportResult.textContent = error instanceof Error ? error.message : String(error);
    }
  });

  page.querySelector('#ai-detect')?.addEventListener('click', async () => {
    try {
      const detections = await BrowserAI.detectLanguage(input.value, {
        onProgress: (state: { phase: string; progress: number }): void => {
          console.log(`detections (${state.phase}): ${Math.round(state.progress * 100)}%`);
        },
      });
      result.textContent = JSON.stringify(detections, null, 2);
    } catch (error) {
      showError(error);
    }
  });

  page.querySelector('#ai-summarize')?.addEventListener('click', async () => {
    try {
      const summary = await BrowserAI.summarize(input.value, {
        type: 'key-points',
        format: 'plain-text',
        length: 'short',
        onProgress: (state: { phase: string; progress: number }): void => {
          console.log(`summarize (${state.phase}): ${Math.round(state.progress * 100)}%`);
        },
      });
      result.textContent = summary;
    } catch (error) {
      showError(error);
    }
  });

  page.querySelector('#ai-translate')?.addEventListener('click', async () => {
    try {
      const translation = await BrowserAI.translate(input.value, {
        sourceLanguage: source.value,
        targetLanguage: target.value,
        onProgress: (state: { phase: string; progress: number }): void => {
          console.log(`translate (${state.phase}): ${Math.round(state.progress * 100)}%`);
        },
      });
      result.textContent = translation;
    } catch (error) {
      showError(error);
    }
  });

  return page;
};
