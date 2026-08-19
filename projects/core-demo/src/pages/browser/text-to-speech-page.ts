import { BrowserTextToSpeech } from '@trt-web/core';

export const createTextToSpeechPage = (): HTMLElement => {
  const page = document.createElement('main');
  page.className = 'content';
  page.innerHTML = `<section class="hero"><p class="eyebrow">browser/speech/text-to-speech</p><h1>BrowserTextToSpeech</h1><p>Convert text into spoken audio with the browser Speech Synthesis API.</p></section><section class="card"><label>Text<textarea id="tts-text">Hello from trt web core.</textarea></label><label>Language<input id="tts-lang" value="en-US" /></label><label>Rate<input id="tts-rate" type="number" min="0.1" max="10" step="0.1" value="1" /></label><label>Pitch<input id="tts-pitch" type="number" min="0" max="2" step="0.1" value="1" /></label><label>Volume<input id="tts-volume" type="number" min="0" max="1" step="0.1" value="1" /></label><div class="demo-actions"><button id="tts-support" type="button">Check support</button><button id="tts-speak" type="button">Speak</button><button id="tts-voices" type="button">List voices</button><button id="tts-pause" type="button">Pause</button><button id="tts-resume" type="button">Resume</button><button id="tts-cancel" type="button">Cancel</button></div><pre id="tts-result" class="demo-result">No action run yet.</pre></section>`;
  const result = page.querySelector<HTMLElement>('#tts-result')!;
  const options = () => ({
    lang: page.querySelector<HTMLInputElement>('#tts-lang')!.value,
    rate: Number(page.querySelector<HTMLInputElement>('#tts-rate')!.value),
    pitch: Number(page.querySelector<HTMLInputElement>('#tts-pitch')!.value),
    volume: Number(page.querySelector<HTMLInputElement>('#tts-volume')!.value),
  });
  page.querySelector('#tts-support')?.addEventListener('click', () => {
    result.textContent = `Supported: ${BrowserTextToSpeech.isSupported()}.`;
  });
  page.querySelector('#tts-speak')?.addEventListener('click', async () => {
    try {
      await BrowserTextToSpeech.speak(
        page.querySelector<HTMLTextAreaElement>('#tts-text')!.value,
        options(),
      );
      result.textContent = 'Speech finished.';
    } catch (error) {
      result.textContent = error instanceof Error ? error.message : String(error);
    }
  });
  page.querySelector('#tts-voices')?.addEventListener('click', async () => {
    try {
      result.textContent =
        (await BrowserTextToSpeech.getVoices()).map((voice) => voice.name).join('\n') ||
        'No voices found.';
    } catch (error) {
      result.textContent = error instanceof Error ? error.message : String(error);
    }
  });
  page.querySelector('#tts-pause')?.addEventListener('click', () => {
    BrowserTextToSpeech.pause();
    result.textContent = `Paused: ${BrowserTextToSpeech.isPaused()}.`;
  });
  page.querySelector('#tts-resume')?.addEventListener('click', () => {
    BrowserTextToSpeech.resume();
    result.textContent = `Speaking: ${BrowserTextToSpeech.isSpeaking()}.`;
  });
  page.querySelector('#tts-cancel')?.addEventListener('click', () => {
    BrowserTextToSpeech.cancel();
    result.textContent = 'Speech cancelled.';
  });
  return page;
};
