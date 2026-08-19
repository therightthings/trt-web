import { trt } from '@trt-web/core';

export const createFormatViewCountPage = (): HTMLElement => {
  const page = document.createElement('main');
  page.className = 'content';
  page.innerHTML = /*html*/ `<section class="hero"><p class="eyebrow">number-handler/format-view-count</p><h1>formatViewCount</h1><p>Format large counts with compact k, m, b and t suffixes.</p></section><section class="card"><label>View count <input id="view-count" type="number" min="0" value="1250000" /></label><label>Decimal places <input id="view-decimals" type="number" min="0" value="1" /></label><label><input id="view-uppercase" type="checkbox" /> Uppercase suffix</label><button id="view-format-run" type="button">Format count</button><pre id="view-format-result" class="demo-result">No count formatted yet.</pre></section>`;
  page.querySelector('#view-format-run')?.addEventListener('click', () => {
    const result = trt.number.formatViewCount(
      Number(page.querySelector<HTMLInputElement>('#view-count')!.value),
      {
        decimalPlaces: Number(page.querySelector<HTMLInputElement>('#view-decimals')!.value),
        uppercase: page.querySelector<HTMLInputElement>('#view-uppercase')!.checked,
      },
    );
    page.querySelector('#view-format-result')!.textContent = result;
  });
  return page;
};
