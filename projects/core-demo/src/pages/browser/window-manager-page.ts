import { BrowserWindowManager } from '@trt-web/core';

export const createWindowManagerPage = (): HTMLElement => {
  const page = document.createElement('main');
  page.className = 'content';
  page.innerHTML = /*html*/ `
    <section class="hero">
      <p class="eyebrow">browser/window-manager</p>
      <h1>BrowserWindowManager</h1>
      <p>Open a child window and listen only to the lifecycle events you need.</p>
    </section>
    <section class="card">
      <div class="form-grid">
        <label>URL <input id="manager-url" type="text" value="about:blank" /></label>
        <label>Window title <input id="manager-title" type="text" value="Window Manager demo" /></label>
        <label>Features <input id="manager-features" type="text" value="width=600,height=400" /></label>
        <label>Poll interval (ms) <input id="manager-poll" type="number" min="50" value="250" /></label>
      </div>
      <p>Assigning a callback starts listening for that event.</p>
      <div class="demo-actions">
        <button id="manager-open">Open child window</button>
        <button id="manager-close" disabled>Close child window</button>
      </div>
      <pre id="manager-result" class="demo-result">No child window opened.</pre>
    </section>`;

  const result = page.querySelector<HTMLElement>('#manager-result')!;
  const closeButton = page.querySelector<HTMLButtonElement>('#manager-close')!;
  let child: ReturnType<typeof BrowserWindowManager.open> = null;

  page.querySelector('#manager-open')?.addEventListener('click', () => {
    child?.close();
    child = BrowserWindowManager.open({
      url: page.querySelector<HTMLInputElement>('#manager-url')!.value,
      title: page.querySelector<HTMLInputElement>('#manager-title')!.value,
      features: page.querySelector<HTMLInputElement>('#manager-features')!.value,
      pollInterval: Number(page.querySelector<HTMLInputElement>('#manager-poll')!.value),
    });

    if (!child) {
      result.textContent = 'The browser blocked the child window.';
      closeButton.disabled = true;
      return;
    }

    closeButton.disabled = false;
    child.onFocus = () => (result.textContent = 'Event: focus');
    child.onBlur = () => (result.textContent = 'Event: blur');
    child.onResize = (info) => {
      result.textContent = JSON.stringify({ event: 'resize', ...info }, null, 2);
    };
    child.onZoomChange = (info) => {
      result.textContent = JSON.stringify({ event: 'zoom-change', ...info }, null, 2);
    };
    child.onClose = () => {
      result.textContent = 'Event: close';
      child = null;
      closeButton.disabled = true;
    };
    result.textContent = 'Child window opened. Focus, resize, zoom or close it to emit events.';
  });

  closeButton.addEventListener('click', () => {
    child?.close();
    child = null;
    closeButton.disabled = true;
    result.textContent = 'Child window closed by the demo.';
  });

  return page;
};
