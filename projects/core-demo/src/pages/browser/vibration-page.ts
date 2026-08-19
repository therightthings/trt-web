import { BrowserVibration } from '@trt-web/core';
export const createVibrationPage = (): HTMLElement => {
  const page = document.createElement('main');
  page.className = 'content';
  page.innerHTML = /*html*/ `<section class="hero"><p class="eyebrow">browser/vibration</p><h1>BrowserVibration</h1><p>Trigger a custom vibration pattern or cancel it.</p></section><section class="card"><label>Pattern <input id="vibration-pattern" value="200,100,200" /></label><div class="demo-actions"><button id="vibration-support">Check support</button><button id="vibration-run">Vibrate</button><button id="vibration-cancel">Cancel</button></div><p id="vibration-result" class="demo-result">No action run yet.</p></section>`;
  const result = page.querySelector<HTMLElement>('#vibration-result')!;
  page.querySelector('#vibration-support')?.addEventListener('click', () => {
    result.textContent = `Supported: ${BrowserVibration.isSupported()}.`;
  });
  page.querySelector('#vibration-run')?.addEventListener('click', () => {
    const pattern = page
      .querySelector<HTMLInputElement>('#vibration-pattern')!
      .value.split(',')
      .map(Number);
    result.textContent = `Vibrate: ${BrowserVibration.vibrate(pattern)}.`;
  });
  page.querySelector('#vibration-cancel')?.addEventListener('click', () => {
    result.textContent = `Cancel: ${BrowserVibration.cancel()}.`;
  });
  return page;
};
