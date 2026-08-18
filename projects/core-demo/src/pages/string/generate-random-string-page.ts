import { trt } from '@trt-web/core';

import { createTestCases } from '../../components/test-cases';

export const createGenerateRandomStringPage = (): HTMLElement => {
  const page = document.createElement('main');
  page.className = 'content';
  page.innerHTML = `<section class="hero"><p class="eyebrow">string-handler/generate-random-string</p><h1>generateRandomString</h1><p>Generate a random hexadecimal string from secure random bytes.</p></section><section class="card"><label>Byte length <input id="random-string-length" type="number" min="0" value="16" /></label><button id="random-string-run" type="button">Generate string</button><pre id="random-string-result" class="demo-result">No string generated yet.</pre></section>`;
  page.querySelector('#random-string-run')?.addEventListener('click', () => {
    try {
      page.querySelector('#random-string-result')!.textContent = trt.string.generateRandomString(
        Number(page.querySelector<HTMLInputElement>('#random-string-length')!.value),
      );
    } catch (error) {
      page.querySelector('#random-string-result')!.textContent =
        error instanceof Error ? error.message : String(error);
    }
  });
  page.append(
    createTestCases([
      { input: 'generateRandomString()', run: () => trt.string.generateRandomString() },
      { input: 'generateRandomString(4)', run: () => trt.string.generateRandomString(4) },
    ]),
  );
  return page;
};
