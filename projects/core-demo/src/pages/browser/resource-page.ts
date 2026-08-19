import { BrowserResource } from '@trt-web/core';

export const createResourcePage = (): HTMLElement => {
  const page = document.createElement('main');
  page.className = 'content';
  page.innerHTML = /*html*/ `<section class="hero"><p class="eyebrow">browser/resource</p><h1>BrowserResource</h1><p>Resolve, cache-check, load and download browser resources.</p></section><section class="card"><label>Resource URL <input id="resource-url" value="/favicon.ico" /></label><label>Resource type<select id="resource-type"><option>document</option><option>image</option><option>script</option><option>style</option><option>font</option><option>media</option></select></label><label>Download name <input id="resource-name" value="core-demo-resource" /></label><div class="demo-actions"><button id="resource-asset">Asset URL</button><button id="resource-cache">Check cached</button><button id="resource-script">Load script</button><button id="resource-link">Load link</button><button id="resource-download">Download</button></div><pre id="resource-result" class="demo-result">No action run yet.</pre></section>`;
  const result = page.querySelector<HTMLElement>('#resource-result')!;
  const url = () => page.querySelector<HTMLInputElement>('#resource-url')!.value;
  page.querySelector('#resource-asset')?.addEventListener('click', () => {
    result.textContent = BrowserResource.assetUrl(url());
  });
  page.querySelector('#resource-cache')?.addEventListener('click', async () => {
    result.textContent = String(
      await BrowserResource.isCached(url(), {
        type: page.querySelector<HTMLSelectElement>('#resource-type')!.value as 'document',
      }),
    );
  });
  page.querySelector('#resource-script')?.addEventListener('click', async () => {
    try {
      await BrowserResource.loadScript(url());
      result.textContent = 'Script loaded.';
    } catch (error) {
      result.textContent = String(error);
    }
  });
  page.querySelector('#resource-link')?.addEventListener('click', async () => {
    try {
      await BrowserResource.loadLink(url());
      result.textContent = 'Link loaded.';
    } catch (error) {
      result.textContent = String(error);
    }
  });
  page.querySelector('#resource-download')?.addEventListener('click', async () => {
    await BrowserResource.download(url(), {
      target: '_blank',
      name: page.querySelector<HTMLInputElement>('#resource-name')!.value,
    });
    result.textContent = 'Download/preview requested.';
  });
  return page;
};
