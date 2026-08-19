import { trt } from '@trt-web/core';

import { createTestCases } from '../../components/test-cases';

export const createGenerateSortOrderKeyPage = (): HTMLElement => {
  const page = document.createElement('main');
  page.className = 'content';
  page.innerHTML = `<section class="hero"><p class="eyebrow">string-handler/generate-sort-order-key</p><h1>generateSortOrderKey</h1><p>Generate a sortable key before, after or between existing keys.</p></section><section class="card"><label>Previous key <input id="sort-previous" placeholder="optional" /></label><label>Next key <input id="sort-next" placeholder="optional" /></label><button id="sort-run" type="button">Generate key</button><pre id="sort-result" class="demo-result">No key generated yet.</pre><p class="demo-result">Tip: generate an initial key with both fields empty, then use it as previous or next.</p></section>`;
  const result = page.querySelector<HTMLElement>('#sort-result')!;
  page.querySelector('#sort-run')?.addEventListener('click', () => {
    try {
      const previous = page.querySelector<HTMLInputElement>('#sort-previous')!.value || undefined;
      const next = page.querySelector<HTMLInputElement>('#sort-next')!.value || undefined;
      result.textContent = trt.string.generateSortOrderKey({ previous, next });
    } catch (error) {
      result.textContent = error instanceof Error ? error.message : String(error);
    }
  });
  page.append(
    createTestCases([
      { input: `generateSortOrderKey()`, run: () => trt.string.generateSortOrderKey() },
      {
        input: `generateSortOrderKey({ previous: '0'.repeat(64), next: 'z'.repeat(64) })`,
        run: () =>
          trt.string.generateSortOrderKey({ previous: '0'.repeat(64), next: 'z'.repeat(64) }),
      },
      {
        input: `generateSortOrderKey({ next: '0'.repeat(64) })`,
        run: () => trt.string.generateSortOrderKey({ next: '0'.repeat(64) }),
      },
      {
        input: `generateSortOrderKey({ previous: 'U'.padEnd(64, '0') })`,
        run: () => trt.string.generateSortOrderKey({ previous: 'U'.padEnd(64, '0') }),
      },
      {
        input: `generateSortOrderKey({ next: 'U'.padEnd(64, '0') })`,
        run: () => trt.string.generateSortOrderKey({ next: 'U'.padEnd(64, '0') }),
      },
      {
        input: `generateSortOrderKey({ previous: 'U'.padEnd(64, '0'), next: 'U'.padEnd(64, '0') })`,
        run: () =>
          trt.string.generateSortOrderKey({
            previous: 'U'.padEnd(64, '0'),
            next: 'U'.padEnd(64, '0'),
          }),
      },
      {
        input: `generateSortOrderKey({ previous: 'abc$', next: 'abcd' })`,
        run: () => trt.string.generateSortOrderKey({ previous: 'abc$', next: 'abcd' }),
      },
      {
        input: `generateSortOrderKey({ previous: 'z'.repeat(64) })`,
        run: () => trt.string.generateSortOrderKey({ previous: 'z'.repeat(64) }),
      },
      {
        input: `generateSortOrderKey({ previous: '0'.repeat(64), next: '0'.repeat(63) + '1' })`,
        run: () =>
          trt.string.generateSortOrderKey({ previous: '0'.repeat(64), next: '0'.repeat(63) + '1' }),
      },
    ]),
  );
  return page;
};
