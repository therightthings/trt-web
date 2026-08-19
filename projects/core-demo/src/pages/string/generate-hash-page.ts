import { trt } from '@trt-web/core';

import { createTestCases } from '../../components/test-cases';

export const createGenerateHashPage = (): HTMLElement => {
  const page = document.createElement('main');
  page.className = 'content';
  page.innerHTML = `<section class="hero"><p class="eyebrow">string-handler/generate-hash</p><h1>generateHash</h1><p>Generate a SHA-256 hash from JSON-serializable data.</p></section><section class="card"><label>JSON data<textarea id="hash-input" rows="7">{"id":1,"name":"Alice"}</textarea></label><button id="hash-run" type="button">Generate hash</button><pre id="hash-result" class="demo-result">No hash generated yet.</pre></section>`;
  page.querySelector('#hash-run')?.addEventListener('click', async () => {
    const result = page.querySelector<HTMLElement>('#hash-result')!;
    try {
      result.textContent = await trt.string.generateHash(
        JSON.parse(page.querySelector<HTMLTextAreaElement>('#hash-input')!.value),
      );
    } catch (error) {
      result.textContent = error instanceof Error ? error.message : String(error);
    }
  });
  page.append(
    createTestCases([
      {
        input: `generateHash({ id: 1, name: 'Alice' })`,
        run: () => trt.string.generateHash({ id: 1, name: 'Alice' }),
      },
      { input: 'generateHash(null)', run: () => trt.string.generateHash(null) },
    ]),
  );
  return page;
};
