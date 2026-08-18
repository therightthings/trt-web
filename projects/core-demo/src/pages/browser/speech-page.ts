import { BrowserSpeech } from '@trt-web/core';

export const createSpeechPage = (): HTMLElement => {
  const page = document.createElement('main');
  page.className = 'content';
  page.innerHTML = /*html*/ `<section class="hero"><p class="eyebrow">browser/speech</p><h1>BrowserSpeech</h1><p>Speak text, list voices and recognize speech.</p></section><section class="grid"><article class="card"><label>Text <textarea id="speech-text">Hello from trt web core.</textarea></label><label>Language <input id="speech-lang" value="en-US" /></label><label>Rate <input id="speech-rate" type="number" min="0.1" max="10" step="0.1" value="1" /></label><label>Pitch <input id="speech-pitch" type="number" min="0" max="2" step="0.1" value="1" /></label><div class="demo-actions"><button id="speech-speak">Speak</button><button id="speech-voices">List voices</button><button id="speech-pause">Pause</button><button id="speech-resume">Resume</button><button id="speech-cancel">Cancel</button></div></article><article class="card"><div class="demo-actions"><button id="speech-recognize">Recognize speech</button><button id="speech-support">Check support</button></div><pre id="speech-result" class="demo-result">No action run yet.</pre></article></section>`;
  const result = page.querySelector<HTMLElement>('#speech-result')!;
  const options = () => ({
    lang: page.querySelector<HTMLInputElement>('#speech-lang')!.value,
    rate: Number(page.querySelector<HTMLInputElement>('#speech-rate')!.value),
    pitch: Number(page.querySelector<HTMLInputElement>('#speech-pitch')!.value),
  });
  page.querySelector('#speech-speak')?.addEventListener('click', async () => {
    try {
      await BrowserSpeech.speak(
        page.querySelector<HTMLTextAreaElement>('#speech-text')!.value,
        options(),
      );
      result.textContent = 'Speech finished.';
    } catch (error) {
      result.textContent = String(error);
    }
  });
  page.querySelector('#speech-voices')?.addEventListener('click', async () => {
    result.textContent =
      (await BrowserSpeech.getVoices()).map((voice) => voice.name).join('\n') || 'No voices found.';
  });
  page.querySelector('#speech-pause')?.addEventListener('click', () => {
    BrowserSpeech.pause();
    result.textContent = `Paused: ${BrowserSpeech.isPaused()}.`;
  });
  page.querySelector('#speech-resume')?.addEventListener('click', () => {
    BrowserSpeech.resume();
    result.textContent = 'Resumed.';
  });
  page.querySelector('#speech-cancel')?.addEventListener('click', () => {
    BrowserSpeech.cancel();
    result.textContent = 'Cancelled.';
  });
  page.querySelector('#speech-recognize')?.addEventListener('click', async () => {
    result.textContent =
      (await BrowserSpeech.recognize({ lang: options().lang })) ?? 'No speech recognized.';
  });
  page.querySelector('#speech-support')?.addEventListener('click', () => {
    result.textContent = JSON.stringify({
      synthesis: BrowserSpeech.isSynthesisSupported(),
      recognition: BrowserSpeech.isRecognitionSupported(),
    });
  });
  return page;
};
