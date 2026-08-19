import { BrowserWindow } from '@trt-web/core';
export const createWindowPage = (): HTMLElement => {
  const page = document.createElement('main');
  page.className = 'content';
  page.innerHTML = /*html*/ `<section class="hero"><p class="eyebrow">browser/window</p><h1>BrowserWindow</h1><p>Inspect window information and try browser interaction helpers.</p></section><section class="card"><div class="demo-actions"><button id="window-history">History state</button><button id="window-reload">Reload</button><button id="window-alert">Alert</button><button id="window-confirm">Confirm</button><button id="window-prompt">Prompt</button><button id="window-print">Print</button></div><div id="window-pointer" class="pointer-zone" tabindex="0"><strong>Pointer zone</strong><span data-pointer-area="top-left">Top left</span><span data-pointer-area="center">Center</span><span data-pointer-area="bottom-right">Bottom right</span></div><pre id="window-result" class="demo-result">Hover over a pointer area.</pre></section>`;
  const result = page.querySelector<HTMLElement>('#window-result')!;
  const pointerTarget = page.querySelector<HTMLElement>('#window-pointer')!;
  page.querySelector('#window-history')?.addEventListener('click', () => {
    result.textContent = JSON.stringify(BrowserWindow.historyState(), null, 2);
  });
  page.querySelector('#window-reload')?.addEventListener('click', () => BrowserWindow.reload());
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
  pointerTarget.addEventListener('pointermove', (event) => {
    const area = (event.target as HTMLElement).dataset.pointerArea ?? 'pointer-zone';
    result.textContent = JSON.stringify(
      {
        area,
        pointer: BrowserWindow.getPointerEventInfo(event),
      },
      null,
      2,
    );
  });
  pointerTarget.addEventListener('keydown', (event) => {
    result.textContent = JSON.stringify(BrowserWindow.getKeyboardEventInfo(event), null, 2);
  });
  return page;
};
