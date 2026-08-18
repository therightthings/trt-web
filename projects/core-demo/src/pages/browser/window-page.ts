import { BrowserWindow } from '@trt-web/core';
export const createWindowPage = (): HTMLElement => {
  const page = document.createElement('main');
  page.className = 'content';
  page.innerHTML = /*html*/ `<section class="hero"><p class="eyebrow">browser/window</p><h1>BrowserWindow</h1><p>Inspect window information and try browser interaction helpers.</p></section><section class="card"><div class="demo-actions"><button id="window-info">Screen info</button><button id="window-alert">Alert</button><button id="window-confirm">Confirm</button><button id="window-prompt">Prompt</button><button id="window-print">Print</button></div><pre id="window-result" class="demo-result">No action run yet.</pre></section>`;
  const result = page.querySelector<HTMLElement>('#window-result')!;
  page.querySelector('#window-info')?.addEventListener('click', () => {
    result.textContent = JSON.stringify(BrowserWindow.screenInfo(), null, 2);
  });
  page.querySelector('#window-alert')?.addEventListener('click', () => {
    BrowserWindow.alert('Hello from BrowserWindow');
    result.textContent = 'Alert opened.';
  });
  page.querySelector('#window-confirm')?.addEventListener('click', () => {
    result.textContent = `Confirm: ${BrowserWindow.confirm('Continue?')}.`;
  });
  page.querySelector('#window-prompt')?.addEventListener('click', () => {
    result.textContent = `Prompt: ${BrowserWindow.prompt('Your name?') ?? 'cancelled'}.`;
  });
  page.querySelector('#window-print')?.addEventListener('click', () => {
    BrowserWindow.print();
    result.textContent = 'Print requested.';
  });
  return page;
};
