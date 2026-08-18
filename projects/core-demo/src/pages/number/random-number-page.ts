import { trt } from '@trt-web/core';

export const createRandomNumberPage = (): HTMLElement => {
  const page = document.createElement('main');
  page.className = 'content';
  page.innerHTML = /*html*/ `<section class="hero"><p class="eyebrow">number-handler/random-number</p><h1>generateRandomNumber</h1><p>Generate an inclusive integer or decimal value between two bounds.</p></section><section class="card"><label>Minimum <input id="random-min" type="number" step="any" value="1" /></label><label>Maximum <input id="random-max" type="number" step="any" value="10" /></label><label><input id="random-decimal" type="checkbox" /> Decimal mode</label><label>Decimal places <input id="random-places" type="number" min="0" value="2" /></label><button id="random-run" type="button">Generate number</button><pre id="random-result" class="demo-result">No number generated yet.</pre></section>`;
  const result = page.querySelector<HTMLElement>('#random-result')!;
  page.querySelector('#random-run')?.addEventListener('click', () => {
    try {
      result.textContent = String(
        trt.number.generateRandomNumber(
          Number(page.querySelector<HTMLInputElement>('#random-min')!.value),
          Number(page.querySelector<HTMLInputElement>('#random-max')!.value),
          {
            decimal: page.querySelector<HTMLInputElement>('#random-decimal')!.checked,
            decimalPlaces: Number(page.querySelector<HTMLInputElement>('#random-places')!.value),
          },
        ),
      );
    } catch (error) {
      result.textContent = error instanceof Error ? error.message : String(error);
    }
  });
  return page;
};
