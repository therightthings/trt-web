import { BrowserEnvironment } from '@trt-web/browser';

export const createEnvironmentPage = (): HTMLElement => {
  const page = document.createElement('main');
  page.className = 'content';
  page.innerHTML = /*html*/ `<section class="hero"><p class="eyebrow">browser/environment</p><h1>BrowserEnvironment</h1><p>Inspect each information scope independently.</p></section><section class="card"><div class="demo-actions"><button data-scope="all">All (default)</button><button data-scope="hardware">Hardware</button><button data-scope="battery">Battery</button><button data-scope="environment">Environment</button><button data-scope="screen">Screen</button></div><pre id="environment-result" class="demo-result">No action run yet.</pre></section>`;
  const result = page.querySelector<HTMLElement>('#environment-result')!;
  page.querySelectorAll<HTMLButtonElement>('[data-scope]').forEach((button) =>
    button.addEventListener('click', async () => {
      result.textContent = JSON.stringify(
        await BrowserEnvironment.getInformation({ scope: button.dataset.scope as 'all' }),
        null,
        2,
      );
    }),
  );
  return page;
};
