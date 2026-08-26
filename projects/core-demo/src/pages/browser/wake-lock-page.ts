import { BrowserWakeLock } from '@trt-web/browser';
export const createWakeLockPage = (): HTMLElement => {
  const page = document.createElement('main');
  page.className = 'content';
  page.innerHTML = /*html*/ `<section class="hero"><p class="eyebrow">browser/wake-lock</p><h1>BrowserWakeLock</h1><p>Keep the screen awake while this page is active.</p></section><section class="card"><div class="demo-actions"><button id="wake-support">Check support</button><button id="wake-enable">Enable</button><button id="wake-disable">Disable</button><button id="wake-state">Read state</button></div><p id="wake-result" class="demo-result">No action run yet.</p></section>`;
  const result = page.querySelector<HTMLElement>('#wake-result')!;
  page.querySelector('#wake-support')?.addEventListener('click', () => {
    result.textContent = JSON.stringify(
      {
        supported: BrowserWakeLock.isSupported(),
        active: BrowserWakeLock.isActive(),
      },
      null,
      2,
    );
  });
  page.querySelector('#wake-enable')?.addEventListener('click', async () => {
    try {
      const enabled = await BrowserWakeLock.enable();
      result.textContent = JSON.stringify({ enabled, active: BrowserWakeLock.isActive() }, null, 2);
    } catch (error) {
      result.textContent = `Enable failed: ${String(error)}.`;
    }
  });
  page.querySelector('#wake-disable')?.addEventListener('click', async () => {
    try {
      await BrowserWakeLock.disable();
      result.textContent = JSON.stringify({ enabled: false, active: false }, null, 2);
    } catch (error) {
      result.textContent = `Disable failed: ${String(error)}.`;
    }
  });
  page.querySelector('#wake-state')?.addEventListener('click', () => {
    result.textContent = JSON.stringify({ active: BrowserWakeLock.isActive() }, null, 2);
  });
  return page;
};
