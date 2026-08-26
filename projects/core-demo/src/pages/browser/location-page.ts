import { BrowserLocation } from '@trt-web/browser';

export const createLocationPage = (): HTMLElement => {
  const page = document.createElement('main');
  page.className = 'content';
  page.innerHTML = /*html*/ `<section class="hero"><p class="eyebrow">browser/location</p><h1>BrowserLocation</h1><p>Request the current location with a selectable speed preset.</p></section><section class="card"><label>Speed<select id="location-speed"><option value="accurate">accurate</option><option value="fast">fast</option></select></label><button id="location-get">Get location</button><pre id="location-result" class="demo-result">No action run yet.</pre></section>`;
  const result = page.querySelector<HTMLElement>('#location-result')!;
  page.querySelector('#location-get')?.addEventListener('click', async () => {
    const speed = page.querySelector<HTMLSelectElement>('#location-speed')!.value as
      | 'accurate'
      | 'fast';
    result.textContent = JSON.stringify(await BrowserLocation.getLocation({ speed }), null, 2);
  });
  return page;
};
