import { trt } from '@trt-web/core';

export const createHaversineDistancePage = (): HTMLElement => {
  const page = document.createElement('main');
  page.className = 'content';
  page.innerHTML = /*html*/ `<section class="hero"><p class="eyebrow">number-handler/haversine-distance</p><h1>calcHaversineDistance</h1><p>Calculate the great-circle distance between two latitude/longitude points.</p></section><section class="card"><h2>From</h2><label>Latitude <input id="distance-from-lat" type="number" step="any" value="10.7769" /></label><label>Longitude <input id="distance-from-lon" type="number" step="any" value="106.7009" /></label><h2>To</h2><label>Latitude <input id="distance-to-lat" type="number" step="any" value="21.0278" /></label><label>Longitude <input id="distance-to-lon" type="number" step="any" value="105.8342" /></label><label>Unit<select id="distance-unit"><option value="km">km</option><option value="m">m</option></select></label><button id="distance-run" type="button">Calculate distance</button><pre id="distance-result" class="demo-result">No distance calculated yet.</pre></section>`;
  const number = (id: string) => Number(page.querySelector<HTMLInputElement>(id)!.value);
  page.querySelector('#distance-run')?.addEventListener('click', () => {
    const result = trt.number.calcHaversineDistance(
      { latitude: number('#distance-from-lat'), longitude: number('#distance-from-lon') },
      { latitude: number('#distance-to-lat'), longitude: number('#distance-to-lon') },
      { unit: page.querySelector<HTMLSelectElement>('#distance-unit')!.value as 'km' | 'm' },
    );
    page.querySelector('#distance-result')!.textContent =
      `${result} ${page.querySelector<HTMLSelectElement>('#distance-unit')!.value}`;
  });
  return page;
};
