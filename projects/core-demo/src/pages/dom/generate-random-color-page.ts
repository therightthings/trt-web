import { trt } from '@trt-web/core';

export const createGenerateRandomColorPage = (): HTMLElement => {
  const page = document.createElement('main');
  page.className = 'content';
  page.innerHTML = /*html*/ `
    <section class="hero">
      <p class="eyebrow">dom-handler/generate-random-color</p>
      <h1>generateRandomColor</h1>
      <p>Generate random hexadecimal or RGB colors with optional opacity.</p>
    </section>
    <section class="card">
      <label>Format
        <select id="color-format">
          <option value="hex">hex</option>
          <option value="rgb">rgb</option>
        </select>
      </label>
      <label>Opacity <input id="color-opacity" type="number" min="0" max="1" step="0.1" value="1" /></label>
      <div class="demo-actions"><button id="color-generate" type="button">Generate color</button></div>
      <div id="color-preview" class="color-preview"></div>
      <pre id="color-result" class="demo-result">No color generated yet.</pre>
    </section>
  `;

  const result = page.querySelector<HTMLElement>('#color-result')!;
  const preview = page.querySelector<HTMLElement>('#color-preview')!;
  page.querySelector('#color-generate')?.addEventListener('click', () => {
    const color = trt.dom.generateRandomColor({
      format: page.querySelector<HTMLSelectElement>('#color-format')!.value as 'hex' | 'rgb',
      opacity: Number(page.querySelector<HTMLInputElement>('#color-opacity')!.value),
    });
    preview.style.backgroundColor = color;
    result.textContent = color;
  });

  return page;
};
