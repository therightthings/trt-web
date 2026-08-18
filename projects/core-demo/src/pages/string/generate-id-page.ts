import { trt } from '@trt-web/core';

import { createTestCases } from '../../components/test-cases';

export const createGenerateIdPage = (): HTMLElement => {
  const page = document.createElement('main');
  page.className = 'content';
  page.innerHTML = `<section class="hero"><p class="eyebrow">string-handler/generate-id</p><h1>generateId</h1><p>Generate a cryptographically random UUID.</p></section><section class="card"><button id="id-run" type="button">Generate ID</button><pre id="id-result" class="demo-result">No ID generated yet.</pre></section>`;
  page.querySelector('#id-run')?.addEventListener('click', () => {
    page.querySelector('#id-result')!.textContent = trt.string.generateId();
  });
  page.append(
    createTestCases([
      {
        input: 'generateId()',
        run: () => trt.string.generateId(),
      },
    ]),
  );
  return page;
};
