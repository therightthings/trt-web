import { trt } from '@trt-web/core';

import { createTestCases } from '../../components/test-cases';

export const createWaitPage = (): HTMLElement => {
  const page = document.createElement('main');
  page.className = 'content';
  page.innerHTML = `<section class="hero"><p class="eyebrow">rate-limit/wait</p><h1>wait</h1><p>Pause an async flow for a number of milliseconds or a time configuration.</p></section><section class="card"><label>Value <input id="wait-value" type="number" min="0" value="1" /></label><label>Unit<select id="wait-unit"><option value="millisecond">millisecond</option><option value="second" selected>second</option><option value="minute">minute</option></select></label><button id="wait-run" type="button">Wait</button><pre id="wait-result" class="demo-result">No wait started yet.</pre></section>`;
  page.querySelector('#wait-run')?.addEventListener('click', async () => {
    const result = page.querySelector<HTMLElement>('#wait-result')!;
    const started = performance.now();
    result.textContent = 'Waiting…';
    await trt.timing.wait({
      value: Number(page.querySelector<HTMLInputElement>('#wait-value')!.value),
      unit: page.querySelector<HTMLSelectElement>('#wait-unit')!.value as
        | 'millisecond'
        | 'second'
        | 'minute',
    });
    result.textContent = `Resolved after approximately ${Math.round(performance.now() - started)} ms.`;
  });
  page.append(
    createTestCases([
      {
        input: `wait({ value: 10, unit: 'millisecond' })`,
        run: async () => {
          const started = performance.now();
          await trt.timing.wait({ value: 10, unit: 'millisecond' });
          return `${Math.round(performance.now() - started)} ms elapsed`;
        },
      },
      {
        input: `wait(10)`,
        run: async () => {
          const started = performance.now();
          await trt.timing.wait(10);
          return `${Math.round(performance.now() - started)} ms elapsed`;
        },
      },
    ]),
  );
  return page;
};
