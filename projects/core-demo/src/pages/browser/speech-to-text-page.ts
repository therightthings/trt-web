import { BrowserSpeechToText } from '@trt-web/browser';

export const createSpeechToTextPage = (): HTMLElement => {
  const page = document.createElement('main');
  page.className = 'content';
  page.innerHTML = `<section class="hero"><p class="eyebrow">browser/speech/speech-to-text</p><h1>BrowserSpeechToText</h1><p>Convert microphone speech into text using the browser Speech Recognition API.</p></section><section class="card"><label>Language<select id="stt-lang"><option value="en-US">English</option><option value="vi-VN">Vietnamese</option><option value="ko-KR">Korean</option><option value="zh-CN">Chinese</option><option value="ja-JP">Japanese</option></select></label><label><input id="stt-interim" type="checkbox" /> Include interim results</label><label>Max alternatives<input id="stt-alternatives" type="number" min="1" value="1" /></label><div class="demo-actions"><button id="stt-support" type="button">Check support</button><button id="stt-recognize" type="button">Recognize speech</button></div><pre id="stt-result" class="demo-result">No speech recognized.</pre></section>`;
  const result = page.querySelector<HTMLElement>('#stt-result')!;
  page.querySelector('#stt-support')?.addEventListener('click', () => {
    try {
      result.textContent = `Supported: ${BrowserSpeechToText.isSupported()}.`;
    } catch (error) {
      result.textContent = error instanceof Error ? error.message : String(error);
    }
  });
  page.querySelector('#stt-recognize')?.addEventListener('click', async () => {
    result.textContent = 'Listening...';
    try {
      const transcript = await BrowserSpeechToText.recognize({
        lang: page.querySelector<HTMLInputElement>('#stt-lang')!.value,
        interimResults: page.querySelector<HTMLInputElement>('#stt-interim')!.checked,
        maxAlternatives: Number(page.querySelector<HTMLInputElement>('#stt-alternatives')!.value),
      });
      result.textContent = transcript ?? 'No speech recognized.';
    } catch (error) {
      result.textContent = error instanceof Error ? error.message : String(error);
    }
  });
  return page;
};
