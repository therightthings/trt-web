import { BrowserWakeLock } from '@trt-web/core';
export const createWakeLockPage = (): HTMLElement => {
  const page = document.createElement('main');
  page.className = 'content';
  page.innerHTML = /*html*/ `<section class="hero"><p class="eyebrow">browser/wake-lock</p><h1>BrowserWakeLock</h1><p>Keep the screen awake while this page is active.</p></section><section class="card"><div class="demo-actions"><button id="wake-support">Check support</button><button id="wake-enable">Enable</button><button id="wake-disable">Disable</button><button id="wake-state">Read state</button></div><p id="wake-result" class="demo-result">No action run yet.</p></section>`;
  const result = page.querySelector<HTMLElement>('#wake-result')!;
  page.querySelector('#wake-support')?.addEventListener('click', () => {
    result.textContent = `Supported: ${BrowserWakeLock.isSupported()}.`;
  });
  page.querySelector('#wake-enable')?.addEventListener('click', async () => {
    result.textContent = `Enabled: ${await BrowserWakeLock.enable()}.`;
  });
  page.querySelector('#wake-disable')?.addEventListener('click', async () => {
    await BrowserWakeLock.disable();
    result.textContent = 'Disabled.';
  });
  page.querySelector('#wake-state')?.addEventListener('click', () => {
    result.textContent = `Active: ${BrowserWakeLock.isActive()}.`;
  });
  return page;
};
